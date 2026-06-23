export interface SimulacaoTaxaInput {
  receitas: Array<{ valor: number; dataVencimento: Date; categoria: string; status: string }>
  despesas: Array<{ valor: number; data: Date }>
  percentual: number
}

export interface SimulacaoRateioInput {
  despesas: Array<{ valor: number }>
  unidades: Array<{ id: number; numero: string; bloco: string; proprietario: string }>
  receitas: Array<{ unidadeId: number; valor: number; status: string; categoria: string }>
  tipo: 'fracao_ideal' | 'por_unidade'
}

function mesKey(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

function avg(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export function simularTaxa(input: SimulacaoTaxaInput) {
  const { receitas, despesas, percentual } = input
  const fator = 1 + percentual / 100

  const cotas = receitas.filter((r) => r.categoria === 'condominio' && r.status === 'pago')

  const receitasPorMes = new Map<string, number>()
  for (const r of receitas) {
    if (r.status !== 'pago') continue
    const chave = mesKey(r.dataVencimento)
    receitasPorMes.set(chave, (receitasPorMes.get(chave) || 0) + r.valor)
  }

  const cotasPorMes = new Map<string, number>()
  for (const r of cotas) {
    const chave = mesKey(r.dataVencimento)
    cotasPorMes.set(chave, (cotasPorMes.get(chave) || 0) + r.valor)
  }

  const despesasPorMes = new Map<string, number>()
  for (const d of despesas) {
    const chave = mesKey(d.data)
    despesasPorMes.set(chave, (despesasPorMes.get(chave) || 0) + d.valor)
  }

  const meses = Array.from(
    new Set([...receitasPorMes.keys(), ...despesasPorMes.keys()])
  ).sort()

  const totalReceitas = Array.from(receitasPorMes.values()).reduce((a, b) => a + b, 0)
  const totalCotas = Array.from(cotasPorMes.values()).reduce((a, b) => a + b, 0)
  const totalDespesas = Array.from(despesasPorMes.values()).reduce((a, b) => a + b, 0)

  const receitasAjustadas = totalReceitas + totalCotas * (fator - 1)

  const projecaoMensal = meses.map((mes) => {
    const original = (receitasPorMes.get(mes) || 0) - (despesasPorMes.get(mes) || 0)
    const cotaMes = cotasPorMes.get(mes) || 0
    const receitaAjustada = (receitasPorMes.get(mes) || 0) + cotaMes * (fator - 1)
    const projetado = receitaAjustada - (despesasPorMes.get(mes) || 0)
    return {
      mes,
      original: Math.round(original * 100) / 100,
      projetado: Math.round(projetado * 100) / 100,
    }
  })

  return {
    percentualAjuste: percentual,
    receitasOriginais: Math.round(totalReceitas * 100) / 100,
    receitasAjustadas: Math.round(receitasAjustadas * 100) / 100,
    despesasTotais: Math.round(totalDespesas * 100) / 100,
    saldoOriginal: Math.round((totalReceitas - totalDespesas) * 100) / 100,
    saldoProjetado: Math.round((receitasAjustadas - totalDespesas) * 100) / 100,
    projecaoMensal,
  }
}

export function simularRateio(input: SimulacaoRateioInput) {
  const { despesas, unidades, receitas, tipo } = input
  const totalDespesas = despesas.reduce((a, b) => a + b.valor, 0)

  const fracaoBloco: Record<string, number> = { A: 1.5, B: 1.0, C: 0.8 }

  const valorAtualPorUnidade = new Map<number, number>()
  for (const u of unidades) {
    const receitasUnidade = receitas.filter(
      (r) => r.unidadeId === u.id &&       r.status === 'pago' && r.categoria === 'condominio'
    )
    const media = receitasUnidade.length > 0
      ? receitasUnidade.reduce((a, b) => a + b.valor, 0) / receitasUnidade.length
      : 0
    valorAtualPorUnidade.set(u.id, media)
  }

  let valorProjetadoPorUnidade: Map<number, number>
  if (tipo === 'por_unidade') {
    const igual = totalDespesas / unidades.length
    valorProjetadoPorUnidade = new Map(unidades.map((u) => [u.id, igual]))
  } else {
    const totalFracao = unidades.reduce((sum, u) => sum + (fracaoBloco[u.bloco] || 1), 0)
    valorProjetadoPorUnidade = new Map(
      unidades.map((u) => [
        u.id,
        (totalDespesas * (fracaoBloco[u.bloco] || 1)) / totalFracao,
      ])
    )
  }

  const porUnidade = unidades.map((u) => ({
    unidadeId: u.id,
    numero: u.numero,
    bloco: u.bloco,
    proprietario: u.proprietario,
    valorAtual: Math.round((valorAtualPorUnidade.get(u.id) || 0) * 100) / 100,
    valorProjetado: Math.round((valorProjetadoPorUnidade.get(u.id) || 0) * 100) / 100,
    diferenca:
      Math.round(
        ((valorProjetadoPorUnidade.get(u.id) || 0) - (valorAtualPorUnidade.get(u.id) || 0)) * 100
      ) / 100,
  }))

  return {
    tipo,
    totalRateado: Math.round(totalDespesas * 100) / 100,
    porUnidade,
  }
}
