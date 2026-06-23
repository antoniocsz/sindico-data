'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchBi, fetchPerfilUnidades, fetchRiscoInadimplencia, API_URL } from '@/lib/api'
import KpiCard from '@/components/KpiCard'
import GraficoPizza from '@/components/GraficoPizza'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
  ComposedChart,
} from 'recharts'

type Periodo = '3' | '6' | '12' | '24'

function periodoParaDatas(p: Periodo): { mesInicio: string; mesFim: string } {
  const fim = new Date()
  const ini = new Date()
  ini.setMonth(ini.getMonth() - Number(p))
  return {
    mesInicio: `${ini.getFullYear()}-${String(ini.getMonth() + 1).padStart(2, '0')}`,
    mesFim: `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}`,
  }
}

export default function BiPage() {
  const [data, setData] = useState<any>(null)
  const [perfilData, setPerfilData] = useState<any>(null)
  const [riscoData, setRiscoData] = useState<any>(null)
  const [orcamentoData, setOrcamentoData] = useState<any>(null)
  const [fluxoData, setFluxoData] = useState<any>(null)
  const [periodo, setPeriodo] = useState<Periodo>('12')
  const [bloco, setBloco] = useState('')
  const [categoria, setCategoria] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    const datas = periodoParaDatas(periodo)
    params.mesInicio = datas.mesInicio
    params.mesFim = datas.mesFim
    if (bloco) params.bloco = bloco
    if (categoria) params.categoria = categoria
    if (status) params.status = status

    try {
      const [bi, perfil, risco, orcamento, fluxo] = await Promise.all([
        fetchBi(params),
        fetchPerfilUnidades(bloco ? { bloco } : undefined),
        fetchRiscoInadimplencia(bloco ? { bloco } : undefined),
        fetch(`${API_URL}/orcamentos`).then((r) => r.json()),
        fetch(`${API_URL}/ml/previsao-fluxo-caixa?meses=6`).then((r) => r.json()),
      ])
      setData(bi)
      setPerfilData(perfil)
      setRiscoData(risco)
      setOrcamentoData(orcamento)
      setFluxoData(fluxo)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [periodo, bloco, categoria, status])

  useEffect(() => { carregar() }, [carregar])

  if (loading && !data) {
    return (
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
        <div className="col-span-full h-72 bg-gray-200 rounded-lg" />
        <div className="col-span-1 h-72 bg-gray-200 rounded-lg" />
        <div className="col-span-1 h-72 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  const kpis = data?.kpis
  const formatarMoeda = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  const contagemPerfil = perfilData?.unidades?.reduce((acc: any, u: any) => {
    const p = u.perfil || 'Desconhecido'
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const construirUrlExport = (formato: string) => {
    const params = new URLSearchParams()
    params.set('formato', formato)
    const datas = periodoParaDatas(periodo)
    params.set('mesInicio', datas.mesInicio)
    params.set('mesFim', datas.mesFim)
    if (bloco) params.set('bloco', bloco)
    if (categoria) params.set('categoria', categoria)
    if (status) params.set('status', status)
    return `${API_URL}/export?${params.toString()}`
  }

  const contagemRisco = riscoData?.unidades?.reduce((acc: any, u: any) => {
    const r = u.risco || 'Desconhecido'
    acc[r] = (acc[r] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Business Intelligence</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500 mr-1">Período:</span>
          {(['3', '6', '12', '24'] as Periodo[]).map((p) => (
            <button
              key={p}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                periodo === p
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setPeriodo(p)}
            >
              {p}m
            </button>
          ))}
        </div>

        <select
          className="border rounded px-3 py-1 text-sm"
          value={bloco}
          onChange={(e) => setBloco(e.target.value)}
        >
          <option value="">Todos os blocos</option>
          <option value="A">Bloco A</option>
          <option value="B">Bloco B</option>
          <option value="C">Bloco C</option>
        </select>

        <select
          className="border rounded px-3 py-1 text-sm"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          <option value="agua">Água</option>
          <option value="luz">Luz</option>
          <option value="folha">Folha</option>
          <option value="limpeza">Limpeza</option>
          <option value="manutencao">Manutenção</option>
          <option value="seguranca">Segurança</option>
        </select>

        <select
          className="border rounded px-3 py-1 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="pago">Pagos</option>
          <option value="pendente">Pendentes</option>
          <option value="atrasado">Atrasados</option>
        </select>

        {loading && <span className="text-sm text-blue-600 ml-auto">Atualizando...</span>}

        <div className="flex items-center gap-2 ml-auto">
          <a
            href={construirUrlExport('pdf')}
            download
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            PDF
          </a>
          <a
            href={construirUrlExport('csv')}
            download
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            CSV
          </a>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <KpiCard
            titulo="Saldo Atual"
            valor={formatarMoeda(kpis.saldoAtual)}
            cor={kpis.saldoAtual >= 0 ? 'green' : 'red'}
          />
          <KpiCard
            titulo="Receitas"
            valor={formatarMoeda(kpis.receitasPeriodo)}
            cor="blue"
            variacao={kpis.variacaoReceita}
          />
          <KpiCard
            titulo="Despesas"
            valor={formatarMoeda(kpis.despesasPeriodo)}
            cor="red"
            variacao={kpis.variacaoDespesa}
          />
          <KpiCard
            titulo="Inadimplência"
            valor={`${kpis.inadimplenciaPercent}%`}
            cor={kpis.inadimplenciaPercent > 20 ? 'red' : kpis.inadimplenciaPercent > 10 ? 'yellow' : 'green'}
          />
          <KpiCard
            titulo="Inadimplência (R$)"
            valor={formatarMoeda(kpis.inadimplenciaValor)}
            cor="yellow"
          />
          <KpiCard
            titulo="Despesas/Receitas"
            valor={`${kpis.despesasPeriodo && kpis.receitasPeriodo ? Math.round((kpis.despesasPeriodo / (kpis.receitasPeriodo || 1)) * 100) : 0}%`}
            cor={kpis.despesasPeriodo > kpis.receitasPeriodo ? 'red' : 'green'}
          />
        </div>
      )}

      {orcamentoData?.orcamentos && data?.evolucaoMensal && (
        (() => {
          const orcPorMes: Record<string, number> = {}
          for (const o of orcamentoData.orcamentos) {
            const chave = `${o.ano}-${String(o.mes + 1).padStart(2, '0')}`
            orcPorMes[chave] = (orcPorMes[chave] || 0) + o.valor
          }
          const comparativo = data.evolucaoMensal.map((e: any) => ({
            mes: e.mes,
            orcado: orcPorMes[e.mes] || 0,
            realizado: e.despesas,
            diferenca: (orcPorMes[e.mes] || 0) - e.despesas,
          }))
          const totalOrcado = comparativo.reduce((s: number, c: any) => s + c.orcado, 0)
          const totalRealizado = comparativo.reduce((s: number, c: any) => s + c.realizado, 0)
          return (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Orçado vs Realizado</h3>
                <span className="text-xs text-gray-500">
                  Orçado: {formatarMoeda(totalOrcado)} | Realizado: {formatarMoeda(totalRealizado)} | 
                  Diferença: <span className={totalOrcado - totalRealizado >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatarMoeda(totalOrcado - totalRealizado)}
                  </span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={comparativo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="orcado" fill="#3b82f6" name="Orçado" />
                  <Bar dataKey="realizado" fill="#ef4444" name="Realizado" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )
        })()
      )}

      {data?.evolucaoMensal && data.evolucaoMensal.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-600">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" name="Saldo" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {data?.composicaoDespesas && data.composicaoDespesas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <GraficoPizza
              data={data.composicaoDespesas.map((d: any) => ({
                name: d.categoria,
                value: d.valor,
                percentual: d.percentual,
              }))}
              titulo="Despesas por Categoria"
            />
          </div>
        )}

        {data?.inadimplenciaEvolucao && data.inadimplenciaEvolucao.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-600">Evolução da Inadimplência</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.inadimplenciaEvolucao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="percentual" stroke="#eab308" name="% Inadimplência" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#ef4444" name="Valor (R$)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {perfilData && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Perfil das Unidades (K-Means)</h3>
              <a href="/unidades" className="text-xs text-blue-600 hover:underline">Ver detalhes →</a>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Exemplar', cor: 'bg-green-100 text-green-800', chave: 'Exemplar' },
                { label: 'Ocasional', cor: 'bg-yellow-100 text-yellow-800', chave: 'Ocasional' },
                { label: 'Crítico', cor: 'bg-red-100 text-red-800', chave: 'Crítico' },
              ].map(({ label, cor, chave }) => (
                <div key={chave} className={`rounded p-2 text-center ${cor}`}>
                  <p className="text-lg font-bold">{contagemPerfil[chave] || 0}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>
            {perfilData.silhuetaMedia !== undefined && (
              <p className="text-xs text-gray-500">
                Silhueta média: {perfilData.silhuetaMedia.toFixed(3)}
              </p>
            )}
          </div>
        )}

        {riscoData && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-600">Risco de Inadimplência (K-NN)</h3>
              <a href="/inadimplencia" className="text-xs text-blue-600 hover:underline">Ver detalhes →</a>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Baixo', cor: 'bg-green-100 text-green-800', chave: 'baixo' },
                { label: 'Médio', cor: 'bg-yellow-100 text-yellow-800', chave: 'medio' },
                { label: 'Alto', cor: 'bg-red-100 text-red-800', chave: 'alto' },
              ].map(({ label, cor, chave }) => (
                <div key={chave} className={`rounded p-2 text-center ${cor}`}>
                  <p className="text-lg font-bold">{contagemRisco[chave] || 0}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>
            {riscoData.acuracia !== undefined && (
              <p className="text-xs text-gray-500">
                Acurácia do modelo: {(riscoData.acuracia * 100).toFixed(1)}%
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {data?.topFornecedores && data.topFornecedores.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-600">Top Fornecedores</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data.topFornecedores}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="fornecedor" />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                <Bar dataKey="valor" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {fluxoData?.projecao && data?.saldoAcumulado && (() => {
          const hist = data.saldoAcumulado.slice(-12)
          const ultimoSaldo = hist[hist.length - 1]?.saldo || 0
          const dadosProj = fluxoData.projecao.map((p: any) => ({
            mes: p.mes,
            realizado: null as number | null,
            projetado: p.saldoProjetado,
          }))
          const dadosHist = hist.map((h: any) => ({
            mes: h.mes,
            realizado: h.saldo,
            projetado: null as number | null,
          }))
          const todos = [...dadosHist, ...dadosProj]
          return (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Projeção de Fluxo de Caixa</h3>
                <span className="text-xs text-gray-500">
                  Saldo atual: {formatarMoeda(ultimoSaldo)} | Previsto 6m: {formatarMoeda(fluxoData.projecao[fluxoData.projecao.length - 1].saldoProjetado)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={todos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value !== null ? `R$ ${Number(value).toFixed(2)}` : '-'} />
                  <Legend />
                  <Area type="monotone" dataKey="realizado" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} name="Realizado" connectNulls={false} />
                  <Area type="monotone" dataKey="projetado" stroke="#f97316" fill="#fdba74" fillOpacity={0.2} name="Projetado" strokeDasharray="5 5" connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )
        })()}
      </div>

      {data?.receitasPorBloco && data.receitasPorBloco.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <GraficoPizza
            data={data.receitasPorBloco.map((d: any) => ({
              name: `Bloco ${d.bloco}`,
              value: d.valor,
              percentual: d.percentual,
            }))}
            titulo="Receitas por Bloco"
          />
        </div>
      )}
    </div>
  )
}
