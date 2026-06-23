import { prisma } from './db'

function formatMes(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function diffMeses(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()
}

function addMeses(d: Date, n: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + n)
  return r
}

function fimMes(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

function percentual(atual: number, anterior: number): number {
  if (anterior === 0) return 0
  return Math.round(((atual - anterior) / anterior) * 100 * 100) / 100
}

export async function computeBi(params: {
  mesInicio?: string
  mesFim?: string
  bloco?: string
  categoria?: string
  status?: string
}) {
  const { mesInicio, mesFim, bloco, categoria, status } = params
  const now = new Date()
  const agora = new Date(now.getFullYear(), now.getMonth(), 1)

  const parseMes = (s: string) => {
    const [ano, mes] = s.split('-').map(Number)
    return new Date(ano, mes - 1, 1)
  }

  const fim = mesFim ? parseMes(mesFim) : agora
  const inicio = mesInicio ? parseMes(mesInicio) : addMeses(fim, -5)
  const inicioDate = inicio
  const fimDate = fimMes(fim)

  const unidadeFilter = bloco ? { unidade: { bloco } } : {}

  const [receitas, despesas, receitasAnt, despesasAnt] = await Promise.all([
    prisma.receita.findMany({
      where: {
        dataVencimento: { gte: inicioDate, lt: fimDate },
        ...(status ? { status } : {}),
        ...unidadeFilter,
      },
      include: { unidade: true },
      orderBy: { dataVencimento: 'asc' },
    }),
    prisma.despesa.findMany({
      where: {
        data: { gte: inicioDate, lt: fimDate },
        ...(categoria ? { categoria } : {}),
      },
      orderBy: { data: 'asc' },
    }),
    prisma.receita.findMany({
      where: {
        dataVencimento: {
          gte: addMeses(inicioDate, -diffMeses(inicioDate, fimDate)),
          lt: addMeses(fimDate, -diffMeses(inicioDate, fimDate)),
        },
        ...(status ? { status } : {}),
        ...unidadeFilter,
      },
      include: { unidade: true },
    }),
    prisma.despesa.findMany({
      where: {
        data: {
          gte: addMeses(inicioDate, -diffMeses(inicioDate, fimDate)),
          lt: addMeses(fimDate, -diffMeses(inicioDate, fimDate)),
        },
        ...(categoria ? { categoria } : {}),
      },
    }),
  ])

  const receitasPago = receitas.filter((r: any) => r.status === 'pago')
  const totalReceitas = receitasPago.reduce((s: number, r: any) => s + r.valor, 0)
  const totalDespesas = despesas.reduce((s: number, d: any) => s + d.valor, 0)
  const pendentes = receitas.filter((r: any) => r.status === 'pendente' || r.status === 'atrasado')
  const inadimplenciaValor = pendentes.reduce((s: number, r: any) => s + r.valor, 0)
  const inadimplenciaPercent =
    receitas.length > 0 ? Math.round((pendentes.length / receitas.length) * 100) : 0

  const receitasPagoAnt = receitasAnt.filter((r: any) => r.status === 'pago')
  const totalReceitasAnt = receitasPagoAnt.reduce((s: number, r: any) => s + r.valor, 0)
  const totalDespesasAnt = despesasAnt.reduce((s: number, d: any) => s + d.valor, 0)

  const evolucaoMensalMap = new Map<string, { receitas: number; despesas: number }>()
  for (const r of receitasPago) {
    const chave = formatMes(r.dataVencimento)
    const e = evolucaoMensalMap.get(chave) || { receitas: 0, despesas: 0 }
    e.receitas += r.valor
    evolucaoMensalMap.set(chave, e)
  }
  for (const d of despesas) {
    const chave = formatMes(d.data)
    const e = evolucaoMensalMap.get(chave) || { receitas: 0, despesas: 0 }
    e.despesas += d.valor
    evolucaoMensalMap.set(chave, e)
  }

  let saldoAcum = 0
  const evolucaoMensal = Array.from(evolucaoMensalMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => {
      saldoAcum += v.receitas - v.despesas
      return { mes, ...v, saldo: saldoAcum }
    })

  const composicaoMap = new Map<string, number>()
  for (const d of despesas) {
    composicaoMap.set(d.categoria, (composicaoMap.get(d.categoria) || 0) + d.valor)
  }
  const composicaoDespesas = Array.from(composicaoMap.entries())
    .map(([categoria, valor]) => ({
      categoria,
      valor: Math.round(valor * 100) / 100,
      percentual: Math.round((valor / (totalDespesas || 1)) * 10000) / 100,
    }))
    .sort((a, b) => b.valor - a.valor)

  const inadMap = new Map<string, { total: number; inad: number; valor: number }>()
  for (const r of receitas) {
    const chave = formatMes(r.dataVencimento)
    const e = inadMap.get(chave) || { total: 0, inad: 0, valor: 0 }
    e.total++
    if (r.status === 'pendente' || r.status === 'atrasado') {
      e.inad++
      e.valor += r.valor
    }
    inadMap.set(chave, e)
  }
  const inadimplenciaEvolucao = Array.from(inadMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({
      mes,
      percentual: Math.round((v.inad / (v.total || 1)) * 100),
      valor: Math.round(v.valor * 100) / 100,
    }))

  const fornMap = new Map<string, number>()
  for (const d of despesas) {
    fornMap.set(d.fornecedor, (fornMap.get(d.fornecedor) || 0) + d.valor)
  }
  const topFornecedores = Array.from(fornMap.entries())
    .map(([fornecedor, valor]) => ({ fornecedor, valor: Math.round(valor * 100) / 100 }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)

  const blocoMap = new Map<string, number>()
  for (const r of receitasPago) {
    const b = r.unidade.bloco
    blocoMap.set(b, (blocoMap.get(b) || 0) + r.valor)
  }
  const totalBloco = Array.from(blocoMap.values()).reduce((s, v) => s + v, 0)
  const receitasPorBloco = Array.from(blocoMap.entries())
    .map(([bloco, valor]) => ({
      bloco,
      valor: Math.round(valor * 100) / 100,
      percentual: Math.round((valor / (totalBloco || 1)) * 10000) / 100,
    }))
    .sort((a, b) => b.valor - a.valor)

  const saldoAcumulado = evolucaoMensal.map(({ mes, saldo }) => ({ mes, saldo }))

  return {
    kpis: {
      saldoAtual: Math.round((totalReceitas - totalDespesas) * 100) / 100,
      receitasPeriodo: Math.round(totalReceitas * 100) / 100,
      despesasPeriodo: Math.round(totalDespesas * 100) / 100,
      inadimplenciaPercent,
      inadimplenciaValor: Math.round(inadimplenciaValor * 100) / 100,
      variacaoReceita: percentual(totalReceitas, totalReceitasAnt),
      variacaoDespesa: percentual(totalDespesas, totalDespesasAnt),
    },
    evolucaoMensal,
    composicaoDespesas,
    inadimplenciaEvolucao,
    topFornecedores,
    receitasPorBloco,
    saldoAcumulado,
    periodo: {
      inicio: formatMes(inicioDate),
      fim: formatMes(new Date(fimDate.getFullYear(), fimDate.getMonth() - 1, 1)),
    },
  }
}
