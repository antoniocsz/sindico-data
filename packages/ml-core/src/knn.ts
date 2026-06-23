import { euclideanDistance, zScoreNormalize } from './utils'
import { accuracy } from './metrics'

export interface KNNResult {
  predictions: number[]
  probabilities: number[][]
  accuracy: number
}

export function knn(
  trainData: number[][],
  trainLabels: number[],
  testData: number[][],
  testLabels: number[],
  k: number = 5
): KNNResult {
  const allData = [...trainData, ...testData]
  const dims = allData[0].length

  const normalized = allData[0].map((_, colIdx) => {
    const col = allData.map((row) => row[colIdx])
    return zScoreNormalize(col)
  })

  const allNormalized = allData.map((_, rowIdx) =>
    normalized.map((col) => col[rowIdx])
  )

  const trainNorm = allNormalized.slice(0, trainData.length)
  const testNorm = allNormalized.slice(trainData.length)

  const predictions: number[] = []
  const probabilities: number[][] = []

  for (const testPoint of testNorm) {
    const distances = trainNorm.map((trainPoint, idx) => ({
      distance: euclideanDistance(testPoint, trainPoint),
      label: trainLabels[idx],
    }))

    distances.sort((a, b) => a.distance - b.distance)
    const nearest = distances.slice(0, k)

    const classCounts: Record<number, number> = {}
    for (const n of nearest) {
      classCounts[n.label] = (classCounts[n.label] || 0) + 1
    }

    let maxCount = 0
    let predictedClass = 0
    for (const [cls, count] of Object.entries(classCounts)) {
      if (count > maxCount) {
        maxCount = count
        predictedClass = Number(cls)
      }
    }

    predictions.push(predictedClass)

    const prob = Object.fromEntries(
      Object.entries(classCounts).map(([cls, count]) => [cls, count / k])
    )
    probabilities.push(
      Array.from({ length: 3 }, (_, i) => prob[i] || 0)
    )
  }

  const acc = accuracy(testLabels, predictions)

  return {
    predictions,
    probabilities,
    accuracy: acc,
  }
}
