import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { simularRateio } from '@sindico/ml-core'

export async function simulacaoRateioRoutes(app: FastifyInstance) {
  app.post<{ Body: { tipo: 'fracao_ideal' | 'por_unidade' } }>('/', async (req) => {
    const { tipo } = req.body

    if (tipo !== 'fracao_ideal' && tipo !== 'por_unidade') {
      return { erro: 'tipo deve ser "fracao_ideal" ou "por_unidade".' }
    }

    const [despesas, unidades, receitas] = await Promise.all([
      prisma.despesa.findMany(),
      prisma.unidade.findMany(),
      prisma.receita.findMany(),
    ])

    return simularRateio({
      despesas: despesas.map((d) => ({ valor: d.valor })),
      unidades: unidades.map((u) => ({
        id: u.id,
        numero: u.numero,
        bloco: u.bloco,
        proprietario: u.proprietario,
      })),
      receitas: receitas.map((r) => ({
        unidadeId: r.unidadeId,
        valor: r.valor,
        status: r.status,
        categoria: r.categoria,
      })),
      tipo,
    })
  })
}
