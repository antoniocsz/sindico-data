import { zScoreNormalize, mean } from './utils'

export interface LinearRegressionResult {
  theta: number[]
  previsoes: number[]
  r2: number
  rmse: number
  proximaPrevisao: number
}

export function linearRegression(
  X: number[][],
  y: number[],
  alpha: number = 0.01,
  iterations: number = 1000
): LinearRegressionResult {
  const m = y.length
  const n = X[0].length

  const XNormalized = X[0].map((_, colIdx) => ({
    values: zScoreNormalize(X.map((row) => row[colIdx])),
    mean: mean(X.map((row) => row[colIdx])),
    std: Math.sqrt(
      X.map((row) => row[colIdx])
        .reduce((a, b) => a + (b - mean(X.map((r) => r[colIdx]))) ** 2, 0) /
        X.length
    ),
  }))

  const Xnorm = X.map((row) => [
    1,
    ...XNormalized.map((col) => {
      const idx = XNormalized.indexOf(col)
      return (row[idx] - col.mean) / (col.std || 1)
    }),
  ])

  let theta: number[] = new Array(n + 1).fill(0)

  for (let iter = 0; iter < iterations; iter++) {
    const predictions = Xnorm.map((row) =>
      row.reduce((sum, xi, j) => sum + xi * theta[j], 0)
    )

    const errors = predictions.map((p, i) => p - y[i])

    const newTheta = theta.map((_, j) => {
      const gradient = errors.reduce((sum, e, i) => sum + e * Xnorm[i][j], 0) / m
      return theta[j] - alpha * gradient
    })

    theta = newTheta

    if (iter > 0 && iter % 100 === 0) {
      const cost = errors.reduce((sum, e) => sum + e * e, 0) / (2 * m)
      if (cost < 1e-6) break
    }
  }

  const predictions = Xnorm.map((row) =>
    row.reduce((sum, xi, j) => sum + xi * theta[j], 0)
  )

  const yMean = mean(y)
  const ssRes = y.reduce((a, b, i) => a + (b - predictions[i]) ** 2, 0)
  const ssTot = y.reduce((a, b) => a + (b - yMean) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  const rmseValue = Math.sqrt(ssRes / m)

  return {
    theta,
    previsoes: predictions,
    r2,
    rmse: rmseValue,
    proximaPrevisao: 0,
  }
}
