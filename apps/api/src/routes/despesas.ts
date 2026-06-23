import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/db'

export async function despesasRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { categoria, fornecedor, mesInicio, mesFim } = req.query as Record<string, string | undefined>
    const where: any = {}
    if (categoria) where.categoria = categoria
    if (fornecedor) where.fornecedor = fornecedor
    if (mesInicio || mesFim) {
      where.data = {}
      if (mesInicio) where.data.gte = new Date(mesInicio)
      if (mesFim) where.data.lte = new Date(mesFim)
    }
    return prisma.despesa.findMany({
      where,
      orderBy: { data: 'desc' },
    })
  })

  app.post<{
    Body: {
      descricao: string
      valor: number
      data: string
      categoria: string
      fornecedor: string
    }
  }>('/', async (req) => {
    return prisma.despesa.create({
      data: {
        ...req.body,
        data: new Date(req.body.data),
      },
    })
  })

  app.put<{ Params: { id: string }; Body: Record<string, unknown> }>('/:id', async (req) => {
    const data = { ...req.body } as Record<string, unknown>
    if (data.data) data.data = new Date(data.data as string)
    return prisma.despesa.update({
      where: { id: Number(req.params.id) },
      data: data as any,
    })
  })

  app.delete<{ Params: { id: string } }>('/:id', async (req) => {
    return prisma.despesa.delete({ where: { id: Number(req.params.id) } })
  })
}
