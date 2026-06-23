import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/db'

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { mesInicio, mesFim } = req.query as Record<string, string | undefined>
    const now = new Date()
    const mesAtual = mesInicio ? new Date(mesInicio) : new Date(now.getFullYear(), now.getMonth(), 1)
    const mesSeguinte = mesFim ? new Date(mesFim) : new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [receitasMes, despesasMes, receitas, despesas] = await Promise.all([
      prisma.receita.aggregate({
        _sum: { valor: true },
        where: {
          dataVencimento: { gte: mesAtual, lt: mesSeguinte },
          status: 'pago',
        },
      }),
      prisma.despesa.aggregate({
        _sum: { valor: true },
        where: { data: { gte: mesAtual, lt: mesSeguinte } },
      }),
      prisma.receita.findMany({ orderBy: { dataVencimento: 'asc' } }),
      prisma.despesa.findMany({ orderBy: { data: 'asc' } }),
    ])

    const totalReceitas = receitas
      .filter((r) => r.status === 'pago')
      .reduce((a, b) => a + b.valor, 0)
    const totalDespesas = despesas.reduce((a, b) => a + b.valor, 0)

    const pendentes = receitas.filter((r) => r.status === 'pendente' || r.status === 'atrasado')
    const inadimplenciaPercent =
      receitas.length > 0
        ? Math.round((pendentes.length / receitas.length) * 100)
        : 0

    const mesesMap = new Map<string, { receitas: number; despesas: number }>()
    for (const r of receitas) {
      if (r.status !== 'pago') continue
      const chave = `${r.dataVencimento.getFullYear()}-${String(r.dataVencimento.getMonth() + 1).padStart(2, '0')}`
      const atual = mesesMap.get(chave) || { receitas: 0, despesas: 0 }
      atual.receitas += r.valor
      mesesMap.set(chave, atual)
    }
    for (const d of despesas) {
      const chave = `${d.data.getFullYear()}-${String(d.data.getMonth() + 1).padStart(2, '0')}`
      const atual = mesesMap.get(chave) || { receitas: 0, despesas: 0 }
      atual.despesas += d.valor
      mesesMap.set(chave, atual)
    }

    const evolucaoMensal = Array.from(mesesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valores]) => ({ mes, ...valores }))

    return {
      saldoAtual: totalReceitas - totalDespesas,
      receitasMes: receitasMes._sum.valor || 0,
      despesasMes: despesasMes._sum.valor || 0,
      inadimplenciaPercent,
      evolucaoMensal,
    }
  })
}
