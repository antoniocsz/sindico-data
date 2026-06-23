import { mean } from './utils'

export function r2Score(yTrue: number[], yPred: number[]): number {
  const yMean = mean(yTrue)
  const ssRes = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0)
  const ssTot = yTrue.reduce((a, b) => a + (b - yMean) ** 2, 0)
  if (ssTot === 0) return 0
  return 1 - ssRes / ssTot
}

export function rmse(yTrue: number[], yPred: number[]): number {
  const mse = yTrue.reduce((a, b, i) => a + (b - yPred[i]) ** 2, 0) / yTrue.length
  return Math.sqrt(mse)
}

export function silhouetteScore(
  points: number[][],
  labels: number[],
  centroids: number[][]
): number {
  const n = points.length
  if (n === 0 || new Set(labels).size < 2) return 0

  const euclidean = (a: number[], b: number[]) =>
    Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0))

  let totalScore = 0

  for (let i = 0; i < n; i++) {
    const label = labels[i]
    const point = points[i]

    const sameCluster: number[] = []
    const otherClusters: Record<number, number[]> = {}

    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const d = euclidean(point, points[j])
      if (labels[j] === label) {
        sameCluster.push(d)
      } else {
        if (!otherClusters[labels[j]]) otherClusters[labels[j]] = []
        otherClusters[labels[j]].push(d)
      }
    }

    const a =
      sameCluster.length > 0
        ? sameCluster.reduce((s, v) => s + v, 0) / sameCluster.length
        : 0

    let b = Infinity
    for (const clusterId of Object.keys(otherClusters)) {
      const dists = otherClusters[Number(clusterId)]
      const avgDist = dists.reduce((s, v) => s + v, 0) / dists.length
      if (avgDist < b) b = avgDist
    }

    if (b === Infinity) b = a

    const s = Math.max(a, b) > 0 ? (b - a) / Math.max(a, b) : 0
    totalScore += s
  }

  return totalScore / n
}

export function accuracy(yTrue: number[], yPred: number[]): number {
  if (yTrue.length === 0) return 0
  const correct = yTrue.reduce((a, b, i) => a + (b === yPred[i] ? 1 : 0), 0)
  return correct / yTrue.length
}
