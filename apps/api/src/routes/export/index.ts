import { FastifyInstance } from 'fastify'
import { computeBi } from '../../lib/bi'
import { gerarPdf, gerarCsv } from '../../lib/relatorio'

export async function exportRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      formato?: string
      mesInicio?: string
      mesFim?: string
      bloco?: string
      categoria?: string
      status?: string
    }
  }>('/', async (req, reply) => {
    const { formato, mesInicio, mesFim, bloco, categoria, status } = req.query
    const data = await computeBi({ mesInicio, mesFim, bloco, categoria, status })

    if (formato === 'csv') {
      const csv = gerarCsv(data)
      reply.header('Content-Type', 'text/csv; charset=utf-8')
      reply.header('Content-Disposition', `attachment; filename="relatorio-gestao-${data.periodo.inicio}-${data.periodo.fim}.csv"`)
      return csv
    }

    const pdf = await gerarPdf(data)
    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `attachment; filename="relatorio-gestao-${data.periodo.inicio}-${data.periodo.fim}.pdf"`)
    return Buffer.from(pdf)
  })
}
