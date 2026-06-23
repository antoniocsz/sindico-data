interface KpiCardProps {
  titulo: string
  valor: string
  cor: 'green' | 'red' | 'blue' | 'yellow'
  variacao?: number
}

const cores = {
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
}

export default function KpiCard({ titulo, valor, cor, variacao }: KpiCardProps) {
  return (
    <div className={`rounded-lg border-2 p-4 ${cores[cor]}`}>
      <p className="text-sm opacity-75">{titulo}</p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
      {variacao !== undefined && variacao !== 0 && (
        <p className={`text-xs mt-1 ${variacao > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {variacao > 0 ? '↑' : '↓'} {Math.abs(variacao)}%
        </p>
      )}
    </div>
  )
}
