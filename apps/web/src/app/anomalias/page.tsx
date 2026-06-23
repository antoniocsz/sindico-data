'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchAnomaliasDespesas } from '@/lib/api'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

export default function AnomaliasPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroCategoria) params.categoria = filtroCategoria
    try {
      const d = await fetchAnomaliasDespesas(params)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroCategoria])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <p className="text-center py-20">Carregando...</p>
  if (!data) return <p className="text-center py-20 text-red-500">Erro ao carregar.</p>

  const categorias = Array.from(new Set((data.despesas || []).map((d: any) => d.categoria))) as string[]

  const scatterData = (data.despesas || []).map((d: any, i: number) => ({
    index: i,
    valor: d.valor,
    zScore: d.zScoreGlobal,
    anomalia: d.anomaliaGlobal,
    descricao: d.descricao,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Detecção de Anomalias</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total de Despesas</p>
          <p className="text-2xl font-bold">{data.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Anomalias Globais</p>
          <p className="text-2xl font-bold text-red-600">{data.anomaliasGlobal || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Anomalias por Categoria</p>
          <p className="text-2xl font-bold text-orange-600">{data.anomaliasCategoria || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">% Anômalo (Global)</p>
          <p className="text-2xl font-bold">
            {data.total > 0
              ? ((data.anomaliasGlobal / data.total) * 100).toFixed(1) + '%'
              : '0%'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Dispersão: Valor vs Z-Score Global</h2>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              dataKey="index"
              label={{ value: 'Despesa (índice)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              dataKey="valor"
              label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'valor') return [`R$ ${Number(value).toFixed(2)}`, 'Valor']
                return [value, name]
              }}
              labelFormatter={(label: any) => `Despesa #${label}`}
            />
            <Legend />
            <Scatter
              name="Normal"
              data={scatterData.filter((d: any) => !d.anomalia)}
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Scatter
              name="Anomalia"
              data={scatterData.filter((d: any) => d.anomalia)}
              fill="#ef4444"
              fillOpacity={0.8}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-right">Z-Score Global</th>
              <th className="p-3 text-left">Global</th>
              <th className="p-3 text-right">Z-Score Cat.</th>
              <th className="p-3 text-left">Por Cat.</th>
            </tr>
          </thead>
          <tbody>
            {(data.despesas || [])
              .sort((a: any, b: any) => Math.abs(b.zScoreGlobal) - Math.abs(a.zScoreGlobal))
              .map((d: any) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{d.descricao}</td>
                  <td className="p-3 text-right">
                    R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{d.categoria}</span>
                  </td>
                  <td className="p-3 text-right font-mono">{d.zScoreGlobal.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      d.anomaliaGlobal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {d.anomaliaGlobal ? 'Anomalia' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{d.zScoreCategoria.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      d.anomaliaCategoria ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {d.anomaliaCategoria ? 'Anomalia' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
