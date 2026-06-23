'use client'

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface GraficoClusterProps {
  unidades: Array<{
    unidade: { numero: string; bloco: string }
    cluster: number
    perfil: string
    pontualidade: number
    atrasoMedio: number
  }>
  silhueta: number | null
}

const cores = ['#22c55e', '#eab308', '#ef4444']

export default function GraficoCluster({ unidades }: GraficoClusterProps) {
  if (unidades.length === 0) {
    return <p className="text-gray-400">Nenhum dado disponível.</p>
  }

  const grupos = unidades.reduce<Record<string, any[]>>((acc, u) => {
    const key = u.perfil
    if (!acc[key]) acc[key] = []
    acc[key].push({
      nome: `${u.unidade.numero}-${u.unidade.bloco}`,
      pontualidade: u.pontualidade,
      atrasoMedio: u.atrasoMedio,
    })
    return acc
  }, {})

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="pontualidade" name="Pontualidade (%)" unit="%" />
        <YAxis dataKey="atrasoMedio" name="Atraso Médio (dias)" unit="d" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        {Object.entries(grupos).map(([perfil, dados], i) => (
          <Scatter
            key={perfil}
            name={perfil}
            data={dados}
            fill={cores[i] || '#888'}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
