'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface GraficoEvolucaoProps {
  dados: Array<{
    mes: string
    receitas: number
    despesas: number
  }>
}

export default function GraficoEvolucao({ dados }: GraficoEvolucaoProps) {
  if (dados.length === 0) {
    return <p className="text-gray-400">Nenhum dado disponível.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
        <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  )
}
