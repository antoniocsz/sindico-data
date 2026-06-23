import { FastifyInstance } from 'fastify'
import { computeBi } from '../../lib/bi'

export async function biRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { mesInicio, mesFim, bloco, categoria, status } = req.query as Record<
      string,
      string | undefined
    >
    return computeBi({ mesInicio, mesFim, bloco, categoria, status })
  })
}
