'use client'

import { useEffect, useState } from 'react'

const CATEGORIAS = [
  { id: 'agua', label: 'Água' },
  { id: 'luz', label: 'Luz' },
  { id: 'folha', label: 'Folha' },
  { id: 'limpeza', label: 'Limpeza' },
  { id: 'manutencao', label: 'Manutenção' },
  { id: 'seguranca', label: 'Segurança' },
]

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export default function OrcamentosPage() {
  const [ano, setAno] = useState(2025)
  const [valores, setValores] = useState<Record<string, Record<number, number>>>({})
  const [loteAtual, setLoteAtual] = useState<any>(null)
  const [lotes, setLotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const carregar = async () => {
    setLoading(true)
    try {
      const r = await fetch(`http://localhost:3001/api/orcamentos?ano=${ano}`).then((r) => r.json())
      setLoteAtual(r.lote)
      const map: Record<string, Record<number, number>> = {}
      for (const o of r.orcamentos || []) {
        if (!map[o.categoria]) map[o.categoria] = {}
        map[o.categoria][o.mes] = o.valor
      }
      setValores(map)

      const lotesR = await fetch('http://localhost:3001/api/orcamentos/lotes').then((r) => r.json())
      setLotes(lotesR)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [ano])

  const atualizarValor = (categoria: string, mes: number, valor: string) => {
    const v = parseFloat(valor) || 0
    setValores((prev) => ({
      ...prev,
      [categoria]: { ...prev[categoria], [mes]: v },
    }))
  }

  const salvar = async () => {
    setSaving(true)
    setMensagem('')
    const orcamentos: { categoria: string; mes: number; ano: number; valor: number }[] = []
    for (const cat of CATEGORIAS) {
      for (let mes = 0; mes < 12; mes++) {
        const valor = valores[cat.id]?.[mes]
        if (valor !== undefined && valor > 0) {
          orcamentos.push({ categoria: cat.id, mes, ano, valor })
        }
      }
    }
    try {
      await fetch('http://localhost:3001/api/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcamentos, descricao: `Orçamento ${ano}` }),
      })
      setMensagem('Orçamento salvo com sucesso!')
      await carregar()
    } catch (e) {
      setMensagem('Erro ao salvar orçamento.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const totalAno = (cat: string) => {
    let t = 0
    for (let mes = 0; mes < 12; mes++) {
      t += valores[cat]?.[mes] || 0
    }
    return t
  }

  const totalMes = (mes: number) => {
    let t = 0
    for (const cat of CATEGORIAS) {
      t += valores[cat.id]?.[mes] || 0
    }
    return t
  }

  const totalGeral = () => {
    let t = 0
    for (const cat of CATEGORIAS) {
      t += totalAno(cat.id)
    }
    return t
  }

  const formatar = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orçamento</h1>
        <div className="flex items-center gap-3">
          <select
            className="border rounded px-3 py-1 text-sm"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <span className="text-xs text-gray-500">
            {loteAtual ? `v${loteAtual.versao} - ${new Date(loteAtual.dataCriacao).toLocaleDateString('pt-BR')}` : 'Sem orçamento'}
          </span>
        </div>
      </div>

      {mensagem && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${mensagem.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensagem}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-3 py-2 font-medium text-gray-600">Categoria</th>
              {MESES.map((m, i) => (
                <th key={i} className="text-right px-2 py-2 font-medium text-gray-600 w-20">{m}</th>
              ))}
              <th className="text-right px-3 py-2 font-medium text-gray-600">Total Ano</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIAS.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{cat.label}</td>
                {Array.from({ length: 12 }).map((_, mes) => (
                  <td key={mes} className="px-1 py-1">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full text-right border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      value={valores[cat.id]?.[mes] ?? ''}
                      onChange={(e) => atualizarValor(cat.id, mes, e.target.value)}
                      placeholder="0"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium">{formatar(totalAno(cat.id))}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-3 py-2">Total</td>
              {Array.from({ length: 12 }).map((_, mes) => (
                <td key={mes} className="px-3 py-2 text-right">{formatar(totalMes(mes))}</td>
              ))}
              <td className="px-3 py-2 text-right">{formatar(totalGeral())}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          className="bg-blue-700 text-white px-6 py-2 rounded text-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
          onClick={salvar}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Orçamento'}
        </button>
      </div>

      {lotes.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-600">Versões Anteriores</h3>
          <div className="space-y-2">
            {lotes.slice(1).map((lote: any) => (
              <div key={lote.id} className="flex items-center justify-between text-sm border-b pb-2">
                <span>
                  <span className="font-medium">v{lote.versao}</span>
                  {' — '}
                  {lote.descricao}
                </span>
                <span className="text-gray-500">
                  {new Date(lote.dataCriacao).toLocaleDateString('pt-BR')}
                  {' — '}
                  {lote.orcamentos?.length || 0} itens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
