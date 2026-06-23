import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { knn } from '@sindico/ml-core'

export async function riscoInadimplenciaRoutes(app: FastifyInstance) {
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

      const ultimoPagamento = u.receitas
        .filter((r) => r.dataPagamento)
        .sort((a, b) => b.dataPagamento!.getTime() - a.dataPagamento!.getTime())[0]

      const diasUltimoPagamento = ultimoPagamento
        ? Math.floor(
            (Date.now() - ultimoPagamento.dataPagamento!.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 999

      const valorMedio = u.receitas.length > 0
        ? u.receitas.reduce((a, b) => a + b.valor, 0) / u.receitas.length
        : 0

      return {
        unidade: u,
        features: {
          pontualidade: total > 0 ? (pagas / total) * 100 : 0,
          atrasoMedio: atrasos.length > 0 ? atrasos.reduce((a, b) => a + b, 0) / atrasos.length : 0,
          valorMedioCota: valorMedio,
          diasUltimoPagamento,
        },
      }
    })

    if (data.length < 4) {
      return {
        unidades: data.map((d) => ({
          ...d,
          risco: 'medio',
        })),
        acuracia: null,
        erro: 'São necessárias pelo menos 4 unidades para a classificação.',
      }
    }

    const labels: number[] = []
    const features: number[][] = []

    for (const d of data) {
      const { pontualidade, atrasoMedio, valorMedioCota, diasUltimoPagamento } =
        d.features
      features.push([pontualidade, atrasoMedio, valorMedioCota, diasUltimoPagamento])

      if (diasUltimoPagamento > 60 || pontualidade < 40) {
        labels.push(2)
      } else if (diasUltimoPagamento > 30 || pontualidade < 70) {
        labels.push(1)
      } else {
        labels.push(0)
      }
    }

    const splitIdx = Math.floor(features.length * 0.7)
    const trainData = features.slice(0, splitIdx)
    const trainLabels = labels.slice(0, splitIdx)
    const testData = features.slice(splitIdx)
    const testLabels = labels.slice(splitIdx)

    if (trainData.length === 0 || testData.length === 0) {
      return {
        unidades: data.map((d, i) => ({
          ...d,
          risco: ['baixo', 'medio', 'alto'][labels[i]],
        })),
        acuracia: null,
        erro: 'Dados insuficientes para treino/teste.',
      }
    }

    const resultado = knn(trainData, trainLabels, testData, testLabels, 3)

    const allTestPredictions = knn(
      features,
      labels,
      features,
      labels,
      3
    )

    return {
      unidades: data.map((d, i) => ({
        ...d,
        risco: ['baixo', 'medio', 'alto'][allTestPredictions.predictions[i]],
      })),
      acuracia: Math.round(resultado.accuracy * 1000) / 1000,
    }
  })
}
