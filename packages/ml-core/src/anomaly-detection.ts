export interface AnomalyInput {
  id: number
  valor: number
  categoria: string
  descricao: string
  data: string
  fornecedor: string
}

export interface AnomalyResult extends AnomalyInput {
  zScoreGlobal: number
  anomaliaGlobal: boolean
  zScoreCategoria: number
  anomaliaCategoria: boolean
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function std(values: number[]): number {
  const m = mean(values)
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length)
}

function zScores(values: number[]): number[] {
  const m = mean(values)
  const s = std(values)
  if (s === 0) return values.map(() => 0)
  return values.map((v) => (v - m) / s)
}

export function detectAnomalias(
  despesas: AnomalyInput[],
  threshold = 2
): AnomalyResult[] {
  const valores = despesas.map((d) => d.valor)
  const zGlobal = zScores(valores)

  const categorias = [...new Set(despesas.map((d) => d.categoria))]
  const zPorCategoria = new Map<string, number[]>()
  for (const cat of categorias) {
    const vals = despesas.filter((d) => d.categoria === cat).map((d) => d.valor)
    zPorCategoria.set(cat, zScores(vals))
  }

  const catIndex = new Map<string, number>()
  for (const cat of categorias) {
    catIndex.set(cat, 0)
  }

  return despesas.map((d, i) => {
    const idx = catIndex.get(d.categoria)!
    catIndex.set(d.categoria, idx + 1)
    const zCat = zPorCategoria.get(d.categoria)![idx]
    return {
      ...d,
      zScoreGlobal: Math.round(zGlobal[i] * 100) / 100,
      anomaliaGlobal: Math.abs(zGlobal[i]) > threshold,
      zScoreCategoria: Math.round(zCat * 100) / 100,
      anomaliaCategoria: Math.abs(zCat) > threshold,
    }
  })
}
