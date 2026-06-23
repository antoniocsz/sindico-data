'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchPrevisaoDespesas } from '@/lib/api'
import GraficoPrevisao from '@/components/GraficoPrevisao'

export default function AnalisePreditivaPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroCategoria) params.categoria = filtroCategoria
    try {
      const d = await fetchPrevisaoDespesas(params)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroCategoria])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return <p className="text-center py-20">Carregando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Análise Preditiva</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          <option value="agua">Água</option>
          <option value="energia">Energia</option>
          <option value="manutencao">Manutenção</option>
          <option value="limpeza">Limpeza</option>
          <option value="seguranca">Segurança</option>
          <option value="administrativo">Administrativo</option>
        </select>
      </div>

      {data?.erro && (
        <p className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">{data.erro}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Previsão para {data?.proximoMes || '...'}</p>
          <p className="text-2xl font-bold">
            {data?.proximaPrevisao
              ? `R$ ${data.proximaPrevisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : '-'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Coeficiente R²</p>
          <p className="text-2xl font-bold">{data?.r2 ?? '-'}</p>
          <p className="text-xs text-gray-400">
            {data?.r2 ? (data.r2 > 0.7 ? 'Boa correlação' : data.r2 > 0.4 ? 'Correlação moderada' : 'Baixa correlação') : ''}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">RMSE (erro médio)</p>
          <p className="text-2xl font-bold">{data?.rmse ? `R$ ${data.rmse}` : '-'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Despesas: Real vs Previsto</h2>
        <GraficoPrevisao
          meses={data?.meses || []}
          valoresReais={data?.valoresReais || []}
          valoresPrevistos={data?.valoresPrevistos || []}
        />
      </div>
    </div>
  )
}
