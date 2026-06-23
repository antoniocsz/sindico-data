import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { simularTaxa } from '@sindico/ml-core'

export async function simulacaoTaxaRoutes(app: FastifyInstance) {
  app.post<{ Body: { percentual: number } }>('/', async (req) => {
    const { percentual } = req.body

    if (typeof percentual !== 'number' || percentual < -100 || percentual > 1000) {
      return { erro: 'percentual deve ser um número entre -100 e 1000.' }
    }

    const [receitas, despesas] = await Promise.all([
      prisma.receita.findMany(),
      prisma.despesa.findMany(),
    ])

    return simularTaxa({
      receitas: receitas.map((r) => ({
        valor: r.valor,
        dataVencimento: r.dataVencimento,
        categoria: r.categoria,
        status: r.status,
      })),
      despesas: despesas.map((d) => ({
        valor: d.valor,
        data: d.data,
      })),
      percentual,
    })
  })
}
