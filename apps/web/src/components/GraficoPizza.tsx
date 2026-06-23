'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#06b6d4']

interface GraficoPizzaProps {
  data: { name: string; value: number; percentual?: number }[]
  titulo?: string
}

export default function GraficoPizza({ data, titulo }: GraficoPizzaProps) {
  return (
    <div>
      {titulo && <h3 className="text-sm font-semibold mb-3 text-gray-600">{titulo}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percentual }) => `${name} ${percentual ?? 0}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
