'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface GraficoPrevisaoProps {
  meses: string[]
  valoresReais: number[]
  valoresPrevistos: number[]
}

export default function GraficoPrevisao({
  meses,
  valoresReais,
  valoresPrevistos,
}: GraficoPrevisaoProps) {
  if (meses.length === 0) {
    return <p className="text-gray-400">Nenhum dado disponível.</p>
  }

  const dados = meses.map((mes, i) => ({
    mes,
    real: valoresReais[i],
    previsto: valoresPrevistos[i] || null,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="real"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Real"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="previsto"
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Previsto"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
