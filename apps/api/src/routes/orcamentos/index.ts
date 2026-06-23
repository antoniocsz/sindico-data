import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'

export async function orcamentosRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { ano } = req.query as { ano?: string }
    const loteAtual = await prisma.orcamentoLote.findFirst({
      orderBy: { dataCriacao: 'desc' },
      include: { orcamentos: true },
    })

    if (!loteAtual) return { lote: null, orcamentos: [] }

    let orcamentos = loteAtual.orcamentos
    if (ano) {
      orcamentos = orcamentos.filter((o) => o.ano === Number(ano))
    }

    return {
      lote: { id: loteAtual.id, versao: loteAtual.versao, dataCriacao: loteAtual.dataCriacao, descricao: loteAtual.descricao },
      orcamentos,
    }
  })

  app.get<{ Params: { id: string } }>('/lotes/:id', async (req) => {
    const lote = await prisma.orcamentoLote.findUnique({
      where: { id: Number(req.params.id) },
      include: { orcamentos: true },
    })
    if (!lote) return { error: 'Lote não encontrado' }
    return lote
  })

  app.get('/lotes', async () => {
    const lotes = await prisma.orcamentoLote.findMany({
      orderBy: { dataCriacao: 'desc' },
      include: { orcamentos: true },
    })
    return lotes
  })

  app.post<{
    Body: {
      orcamentos: { categoria: string; mes: number; ano: number; valor: number }[]
      descricao?: string
    }
  }>('/', async (req) => {
    const { orcamentos, descricao } = req.body

    const ultimoLote = await prisma.orcamentoLote.findFirst({
      orderBy: { dataCriacao: 'desc' },
    })
    const novaVersao = (ultimoLote?.versao ?? 0) + 1

    const lote = await prisma.orcamentoLote.create({
      data: {
        versao: novaVersao,
        descricao: descricao || `Orçamento v${novaVersao}`,
        orcamentos: {
          create: orcamentos.map((o) => ({
            categoria: o.categoria,
            mes: o.mes,
            ano: o.ano,
            valor: o.valor,
          })),
        },
      },
      include: { orcamentos: true },
    })

    return lote
  })
}
