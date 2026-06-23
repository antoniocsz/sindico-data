export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function buildQuery(params?: Record<string, string | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries as [string, string][]).toString()
}

async function fetchAPI<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const qs = buildQuery(params)
  const res = await fetch(`${API_URL}${path}${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchDashboard(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/dashboard', params)
}

export async function fetchUnidades() {
  return fetchAPI<any[]>('/unidades')
}

export async function fetchReceitas(params?: Record<string, string | undefined>) {
  return fetchAPI<any[]>('/receitas', params)
}

export async function fetchDespesas(params?: Record<string, string | undefined>) {
  return fetchAPI<any[]>('/despesas', params)
}

export async function fetchPrevisaoDespesas(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/ml/previsao-despesas', params)
}

export async function fetchPerfilUnidades(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/ml/perfil-unidades', params)
}

export async function fetchRiscoInadimplencia(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/ml/risco-inadimplencia', params)
}

export async function fetchAnomaliasDespesas(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/ml/anomalias-despesas', params)
}

export async function fetchSimulacaoTaxa(body: { percentual: number }) {
  const res = await fetch(`${API_URL}/ml/simulacao-taxa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchBi(params?: Record<string, string | undefined>) {
  return fetchAPI<any>('/bi', params)
}

export async function fetchSimulacaoRateio(body: { tipo: 'fracao_ideal' | 'por_unidade' }) {
  const res = await fetch(`${API_URL}/ml/simulacao-rateio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
