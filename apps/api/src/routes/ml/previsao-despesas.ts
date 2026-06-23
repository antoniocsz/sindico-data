import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/db'
import { linearRegression } from '@sindico/ml-core'

export async function previsaoDespesasRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { categoria } = req.query as Record<string, string | undefined>
    const where: any = {}
    if (categoria) where.categoria = categoria
    const despesas = await prisma.despesa.findMany({
      where,
      orderBy: { data: 'asc' },
    })

    const mesesMap = new Map<string, number>()
    for (const d of despesas) {
      const chave = `${d.data.getFullYear()}-${String(d.data.getMonth() + 1).padStart(2, '0')}`
      mesesMap.set(chave, (mesesMap.get(chave) || 0) + d.valor)
    }

    const entradas = Array.from(mesesMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    )

    if (entradas.length < 3) {
      return {
        erro: 'São necessários pelo menos 3 meses de dados para a regressão.',
        meses: entradas.map(([m]) => m),
        valoresReais: entradas.map(([, v]) => v),
        valoresPrevistos: [],
        proximaPrevisao: null,
        proximoMes: null,
        r2: null,
        rmse: null,
      }
    }

    const indices = entradas.map((_, i) => i)
    const valores = entradas.map(([, v]) => v)

    const X = indices.map((i) => [i])
    const y = valores

    const resultado = linearRegression(X, y, 0.01, 1000)

    const ultimoIndice = indices[indices.length - 1]
    const xNorm = (ultimoIndice + 1 - mean(indices)) / (std(indices) || 1)
    resultado.proximaPrevisao =
      resultado.theta[0] + resultado.theta[1] * xNorm

    const proximaData = new Date(entradas[entradas.length - 1][0] + '-01')
    proximaData.setMonth(proximaData.getMonth() + 1)
    const proximoMes = `${proximaData.getFullYear()}-${String(proximaData.getMonth() + 1).padStart(2, '0')}`

    return {
      meses: entradas.map(([m]) => m),
      valoresReais: valores,
      valoresPrevistos: resultado.previsoes,
      proximaPrevisao: Math.round(resultado.proximaPrevisao * 100) / 100,
      proximoMes,
      r2: Math.round(resultado.r2 * 10000) / 10000,
      rmse: Math.round(resultado.rmse * 100) / 100,
    }
  })
}

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function std(arr: number[]) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)
}
