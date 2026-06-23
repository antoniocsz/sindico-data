'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchDashboard } from '@/lib/api'
import KpiCard from '@/components/KpiCard'
import GraficoEvolucao from '@/components/GraficoEvolucao'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [meses, setMeses] = useState(6)

  const carregar = useCallback(async (m: number) => {
    setLoading(true)
    const fim = new Date()
    const inicio = new Date(fim.getFullYear(), fim.getMonth() - m + 1, 1)
    const params = {
      mesInicio: inicio.toISOString(),
      mesFim: fim.toISOString(),
    }
    try {
      const d = await fetchDashboard(params)
      setData(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar(meses) }, [meses, carregar])

  if (loading) return <p className="text-center py-20">Carregando...</p>
  if (!data) return <p className="text-center py-20 text-red-500">Erro ao carregar dashboard.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Financeiro</h1>

      <div className="flex gap-3 mb-6">
        <label className="text-sm text-gray-600 self-center">Período:</label>
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={meses}
          onChange={(e) => setMeses(Number(e.target.value))}
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <KpiCard
          titulo="Saldo Atual"
          valor={`R$ ${(data.saldoAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          cor={data.saldoAtual >= 0 ? 'green' : 'red'}
        />
        <KpiCard
          titulo="Receitas do Mês"
          valor={`R$ ${(data.receitasMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          cor="blue"
        />
        <KpiCard
          titulo="Despesas do Mês"
          valor={`R$ ${(data.despesasMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          cor="yellow"
        />
        <KpiCard
          titulo="Inadimplência"
          valor={`${data.inadimplenciaPercent || 0}%`}
          cor={(data.inadimplenciaPercent || 0) > 20 ? 'red' : 'green'}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Evolução Mensal</h2>
        <GraficoEvolucao dados={data.evolucaoMensal || []} />
      </div>
    </div>
  )
}
