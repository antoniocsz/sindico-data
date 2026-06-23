import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/db'

export async function receitasRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { unidadeId, status, mesInicio, mesFim } = req.query as Record<string, string | undefined>
    const where: any = {}
    if (unidadeId) where.unidadeId = Number(unidadeId)
    if (status) where.status = status
    if (mesInicio || mesFim) {
      where.dataVencimento = {}
      if (mesInicio) where.dataVencimento.gte = new Date(mesInicio)
      if (mesFim) where.dataVencimento.lte = new Date(mesFim)
    }
    return prisma.receita.findMany({
      where,
      include: { unidade: true },
      orderBy: { dataVencimento: 'desc' },
    })
  })

  app.post<{
    Body: {
      descricao: string
      valor: number
      dataVencimento: string
      dataPagamento?: string
      unidadeId: number
      categoria: string
    }
  }>('/', async (req) => {
    const { dataPagamento, ...rest } = req.body
    return prisma.receita.create({
      data: {
        ...rest,
        dataVencimento: new Date(rest.dataVencimento),
        dataPagamento: dataPagamento ? new Date(dataPagamento) : null,
        status: dataPagamento ? 'pago' : 'pendente',
      },
    })
  })

  app.put<{ Params: { id: string }; Body: Record<string, unknown> }>('/:id', async (req) => {
    const data = { ...req.body } as Record<string, unknown>
    if (data.dataVencimento) data.dataVencimento = new Date(data.dataVencimento as string)
    if (data.dataPagamento) data.dataPagamento = new Date(data.dataPagamento as string)
    return prisma.receita.update({
      where: { id: Number(req.params.id) },
      data: data as any,
    })
  })

  app.delete<{ Params: { id: string } }>('/:id', async (req) => {
    return prisma.receita.delete({ where: { id: Number(req.params.id) } })
  })
}
