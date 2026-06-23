export function zScoreNormalize(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const std = Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  )
  if (std === 0) return values.map(() => 0)
  return values.map((v) => (v - mean) / std)
}

export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0)
  )
}

export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}
