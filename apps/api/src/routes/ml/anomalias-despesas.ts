import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { detectAnomalias } from '@sindico/ml-core'

export async function anomaliasDespesasRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { categoria, mesInicio, mesFim } = req.query as Record<string, string | undefined>
    const where: any = {}
    if (categoria) where.categoria = categoria
    if (mesInicio || mesFim) {
      where.data = {}
      if (mesInicio) where.data.gte = new Date(mesInicio)
      if (mesFim) where.data.lte = new Date(mesFim)
    }

    const despesas = await prisma.despesa.findMany({ where, orderBy: { data: 'asc' } })

    const input = despesas.map((d) => ({
      id: d.id,
      valor: d.valor,
      categoria: d.categoria,
      descricao: d.descricao,
      data: d.data.toISOString(),
      fornecedor: d.fornecedor,
    }))

    const resultado = detectAnomalias(input)

    return {
      total: resultado.length,
      anomaliasGlobal: resultado.filter((r) => r.anomaliaGlobal).length,
      anomaliasCategoria: resultado.filter((r) => r.anomaliaCategoria).length,
      despesas: resultado,
    }
  })
}
