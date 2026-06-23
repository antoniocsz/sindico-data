import { zScoreNormalize, euclideanDistance } from './utils'
import { silhouetteScore } from './metrics'

export interface KMeansResult {
  labels: number[]
  centroids: number[][]
  silhouetteScore: number
  iterations: number
}

export function kmeans(
  data: number[][],
  k: number = 3,
  maxIterations: number = 100
): KMeansResult {
  const n = data.length
  const dims = data[0].length

  const normalized = data[0].map((_, colIdx) => {
    const col = data.map((row) => row[colIdx])
    return zScoreNormalize(col)
  })

  const dataNorm = data.map((_, rowIdx) =>
    normalized.map((col) => col[rowIdx])
  )

  const centroidIndices = new Set<number>()
  while (centroidIndices.size < k) {
    centroidIndices.add(Math.floor(Math.random() * n))
  }
  let centroids = Array.from(centroidIndices).map((idx) => [...dataNorm[idx]])

  let labels: number[] = new Array(n).fill(0)
  let converged = false
  let iteration = 0

  for (iteration = 0; iteration < maxIterations && !converged; iteration++) {
    const newLabels = dataNorm.map((point) => {
      let minDist = Infinity
      let closest = 0
      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(point, centroids[j])
        if (dist < minDist) {
          minDist = dist
          closest = j
        }
      }
      return closest
    })

    converged =
      labels.length === newLabels.length &&
      labels.every((l, i) => l === newLabels[i])
    labels = newLabels

    if (!converged) {
      centroids = centroids.map((_, j) => {
        const clusterPoints = dataNorm.filter((_, i) => labels[i] === j)
        if (clusterPoints.length === 0) return [...centroids[j]]
        return clusterPoints[0].map((_, dim) =>
          clusterPoints.reduce((sum, p) => sum + p[dim], 0) / clusterPoints.length
        )
      })
    }
  }

  const sil = silhouetteScore(dataNorm, labels, centroids)

  return {
    labels,
    centroids,
    silhouetteScore: sil,
    iterations: iteration,
  }
}
