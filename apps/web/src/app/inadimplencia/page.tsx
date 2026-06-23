'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchRiscoInadimplencia } from '@/lib/api'

const riscoCor = (risco: string) => {
  switch (risco) {
    case 'baixo': return 'bg-green-100 text-green-700 border-green-300'
    case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'alto': return 'bg-red-100 text-red-700 border-red-300'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export default function InadimplenciaPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroBloco, setFiltroBloco] = useState('')
  const [filtroRisco, setFiltroRisco] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroBloco) params.bloco = filtroBloco
    try {
      const d = await fetchRiscoInadimplencia(params)
      if (filtroRisco) {
        d.unidades = d.unidades.filter((u: any) => u.risco === filtroRisco)
      }
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroBloco, filtroRisco])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <p className="text-center py-20">Carregando...</p>

  const blocos = Array.from(new Set((data?.unidades || []).map((u: any) => u.unidade.bloco))) as string[]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Análise de Inadimplência</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroBloco}
          onChange={(e) => setFiltroBloco(e.target.value)}
        >
          <option value="">Todos os blocos</option>
          {blocos.map((b) => (
            <option key={b} value={b}>Bloco {b}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroRisco}
          onChange={(e) => setFiltroRisco(e.target.value)}
        >
          <option value="">Todos os riscos</option>
          <option value="baixo">Baixo</option>
          <option value="medio">Médio</option>
          <option value="alto">Alto</option>
        </select>
      </div>

      {data?.erro && (
        <p className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">{data.erro}</p>
      )}

      {data?.acuracia !== null && data?.acuracia !== undefined && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <p className="text-sm text-gray-500">Acurácia do modelo K-NN</p>
          <p className="text-3xl font-bold">
            {(data.acuracia * 100).toFixed(1)}%
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['baixo', 'medio', 'alto'].map((risco) => {
          const qtd = data?.unidades?.filter(
            (u: any) => u.risco === risco
          ).length || 0
          return (
            <div
              key={risco}
              className={`rounded-lg border-2 p-4 ${riscoCor(risco)}`}
            >
              <p className="text-sm opacity-75 capitalize">Risco {risco}</p>
              <p className="text-2xl font-bold mt-1">{qtd} unidades</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Unidade</th>
              <th className="p-3 text-left">Bloco</th>
              <th className="p-3 text-left">Proprietário</th>
              <th className="p-3 text-left">Risco</th>
              <th className="p-3 text-right">Pontualidade</th>
              <th className="p-3 text-right">Atraso Médio</th>
              <th className="p-3 text-right">Dias Último Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {(data?.unidades || [])
              .sort((a: any, b: any) => {
                const ordem = { alto: 0, medio: 1, baixo: 2 }
                return (ordem as any)[a.risco] - (ordem as any)[b.risco]
              })
              .map((u: any, i: number) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.unidade.numero}</td>
                  <td className="p-3">{u.unidade.bloco}</td>
                  <td className="p-3">{u.unidade.proprietario}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${riscoCor(u.risco)}`}>
                      {u.risco}
                    </span>
                  </td>
                  <td className="p-3 text-right">{u.features.pontualidade.toFixed(0)}%</td>
                  <td className="p-3 text-right">{u.features.atrasoMedio.toFixed(1)} dias</td>
                  <td className="p-3 text-right">{u.features.diasUltimoPagamento}d</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
