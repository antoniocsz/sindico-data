import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { kmeans } from '@sindico/ml-core'

export async function perfilUnidadesRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { bloco } = req.query as Record<string, string | undefined>
    const where: any = {}
    if (bloco) where.bloco = bloco
    const unidades = await prisma.unidade.findMany({
      where,
      include: { receitas: true },
    })

    const data = unidades.map((u) => {
      const total = u.receitas.length
      const pagas = u.receitas.filter((r) => r.status === 'pago').length
      const atrasos = u.receitas
        .filter((r) => r.dataPagamento && r.dataVencimento)
        .map(
          (r) =>
            (r.dataPagamento!.getTime() - r.dataVencimento.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        .filter((d) => d > 0)

      return {
        unidade: u,
        pontualidade: total > 0 ? (pagas / total) * 100 : 0,
        atrasoMedio: atrasos.length > 0 ? atrasos.reduce((a, b) => a + b, 0) / atrasos.length : 0,
        multaTotal: u.receitas
          .filter((r) => r.categoria === 'multa')
          .reduce((a, b) => a + b.valor, 0),
      }
    })

    if (data.length < 3) {
      return {
        unidades: data.map((d) => ({ ...d, cluster: 0 })),
        centroides: [],
        silhuetaMedia: null,
        erro: 'São necessárias pelo menos 3 unidades para o agrupamento.',
      }
    }

    const pontos = data.map((d) => [d.pontualidade, d.atrasoMedio, d.multaTotal])

    const resultado = kmeans(pontos, 3)

    const perfilNome = (cluster: number): string => {
      if (resultado.centroids.length <= cluster) return 'Desconhecido'
      const c = resultado.centroids[cluster]
      if (c[0] > 80) return 'Exemplar'
      if (c[0] > 50) return 'Ocasional'
      return 'Crítico'
    }

    return {
      unidades: data.map((d, i) => ({
        ...d,
        cluster: resultado.labels[i],
        perfil: perfilNome(resultado.labels[i]),
      })),
      centroides: resultado.centroids,
      silhuetaMedia: Math.round(resultado.silhouetteScore * 1000) / 1000,
    }
  })
}
