'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchSimulacaoTaxa, fetchSimulacaoRateio } from '@/lib/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

export default function SimulacaoPage() {
  const [taxaData, setTaxaData] = useState<any>(null)
  const [rateioData, setRateioData] = useState<any>(null)
  const [percentual, setPercentual] = useState(0)
  const [tipoRateio, setTipoRateio] = useState<'por_unidade' | 'fracao_ideal'>('por_unidade')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const carregarTaxa = useCallback(async (pct: number) => {
    try {
      const d = await fetchSimulacaoTaxa({ percentual: pct })
      setTaxaData(d)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const carregarRateio = useCallback(async (tipo: 'por_unidade' | 'fracao_ideal') => {
    try {
      const d = await fetchSimulacaoRateio({ tipo })
      setRateioData(d)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    Promise.all([carregarTaxa(0), carregarRateio('por_unidade')])
      .finally(() => setLoading(false))
  }, [carregarTaxa, carregarRateio])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setPercentual(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => carregarTaxa(val), 300)
  }

  const handleRateioToggle = (tipo: 'por_unidade' | 'fracao_ideal') => {
    setTipoRateio(tipo)
    carregarRateio(tipo)
  }

  if (loading) return <p className="text-center py-20">Carregando...</p>

  const taxaChartData = taxaData?.projecaoMensal?.map((m: any) => ({
    mes: m.mes,
    Original: m.original,
    Projetado: m.projetado,
  })) || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Simulação Financeira</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Simulação de Taxa Condominial</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ajuste o percentual para simular o impacto no saldo financeiro.
        </p>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium w-12 text-right">-50%</span>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={percentual}
            onChange={handleSliderChange}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12">+50%</span>
          <span className="text-lg font-bold text-blue-700 min-w-[4rem] text-center">
            {percentual > 0 ? '+' : ''}{percentual}%
          </span>
        </div>

        {taxaData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500">Receita Original</p>
                <p className="text-lg font-bold">
                  R$ {taxaData.receitasOriginais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-50 rounded p-3">
                <p className="text-xs text-gray-500">Receita Ajustada</p>
                <p className="text-lg font-bold text-blue-700">
                  R$ {taxaData.receitasAjustadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500">Saldo Original</p>
                <p className={`text-lg font-bold ${taxaData.saldoOriginal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  R$ {taxaData.saldoOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-50 rounded p-3">
                <p className="text-xs text-gray-500">Saldo Projetado</p>
                <p className={`text-lg font-bold ${taxaData.saldoProjetado >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  R$ {taxaData.saldoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-600">Projeção Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taxaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="Original" fill="#9ca3af" />
                  <Bar dataKey="Projetado" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Simulação de Rateio</h2>
        <p className="text-sm text-gray-500 mb-4">
          Compare a distribuição atual das cotas com diferentes métodos de rateio.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              tipoRateio === 'por_unidade'
                ? 'bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleRateioToggle('por_unidade')}
          >
            Por Unidade
          </button>
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              tipoRateio === 'fracao_ideal'
                ? 'bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleRateioToggle('fracao_ideal')}
          >
            Fração Ideal
          </button>
        </div>

        {rateioData && (
          <>
            <div className="bg-gray-50 rounded p-3 mb-4 inline-block">
              <p className="text-xs text-gray-500">Total Rateado</p>
              <p className="text-xl font-bold">
                R$ {rateioData.totalRateado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Unidade</th>
                    <th className="p-3 text-left">Bloco</th>
                    <th className="p-3 text-left">Proprietário</th>
                    <th className="p-3 text-right">Valor Atual</th>
                    <th className="p-3 text-right">Valor Projetado</th>
                    <th className="p-3 text-right">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {rateioData.porUnidade.map((u: any) => (
                    <tr key={u.unidadeId} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{u.numero}</td>
                      <td className="p-3">{u.bloco}</td>
                      <td className="p-3">{u.proprietario}</td>
                      <td className="p-3 text-right">
                        R$ {u.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        R$ {u.valorProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-medium ${
                        u.diferenca >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {u.diferenca >= 0 ? '+' : ''}
                        R$ {u.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
