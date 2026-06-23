import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/db'

export async function unidadesRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return prisma.unidade.findMany()
  })

  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    return prisma.unidade.findUnique({ where: { id: Number(req.params.id) } })
  })

  app.post<{
    Body: { numero: string; bloco: string; proprietario: string; email: string }
  }>('/', async (req) => {
    return prisma.unidade.create({ data: req.body })
  })

  app.put<{ Params: { id: string }; Body: Partial<{ numero: string; bloco: string; proprietario: string; email: string }> }>('/:id', async (req) => {
    return prisma.unidade.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    })
  })

  app.delete<{ Params: { id: string } }>('/:id', async (req) => {
    return prisma.unidade.delete({ where: { id: Number(req.params.id) } })
  })
}
