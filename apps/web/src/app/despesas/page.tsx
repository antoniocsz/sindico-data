'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchDespesas } from '@/lib/api'
import Modal from '@/components/Modal'

const API = 'http://localhost:3001/api'

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroFornecedor, setFiltroFornecedor] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState({ descricao: '', valor: '', data: '', categoria: '', fornecedor: '' })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroCategoria) params.categoria = filtroCategoria
    if (filtroFornecedor) params.fornecedor = filtroFornecedor
    if (filtroMes) {
      const [ano, mes] = filtroMes.split('-')
      params.mesInicio = new Date(Number(ano), Number(mes) - 1, 1).toISOString()
      params.mesFim = new Date(Number(ano), Number(mes), 0).toISOString()
    }
    try {
      const d = await fetchDespesas(params)
      setDespesas(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroCategoria, filtroFornecedor, filtroMes])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriacao() {
    setEditando(null)
    setForm({ descricao: '', valor: '', data: '', categoria: 'agua', fornecedor: '' })
    setModalAberto(true)
  }

  function abrirEdicao(d: any) {
    setEditando(d)
    setForm({
      descricao: d.descricao,
      valor: String(d.valor),
      data: d.data.slice(0, 10),
      categoria: d.categoria,
      fornecedor: d.fornecedor,
    })
    setModalAberto(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const body = { descricao: form.descricao, valor: parseFloat(form.valor), data: form.data, categoria: form.categoria, fornecedor: form.fornecedor }
    try {
      if (editando) {
        await fetch(`${API}/despesas/${editando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch(`${API}/despesas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      setModalAberto(false)
      await carregar()
    } catch (e) {
      console.error(e)
    } finally {
      setSalvando(false)
    }
  }

  async function deletar(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
    await fetch(`${API}/despesas/${id}`, { method: 'DELETE' })
    await carregar()
  }

  if (loading) return <p className="text-center py-20">Carregando...</p>

  const categorias = [...new Set(despesas.map((d) => d.categoria))]
  const fornecedores = [...new Set(despesas.map((d) => d.fornecedor))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Despesas</h1>
        <button className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 transition-colors" onClick={abrirCriacao}>
          + Nova Despesa
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="border rounded px-3 py-1.5 text-sm" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
        </select>
        <select className="border rounded px-3 py-1.5 text-sm" value={filtroFornecedor} onChange={(e) => setFiltroFornecedor(e.target.value)}>
          <option value="">Todos os fornecedores</option>
          {fornecedores.map((f) => (<option key={f} value={f}>{f}</option>))}
        </select>
        <input type="month" className="border rounded px-3 py-1.5 text-sm" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {categorias.map((cat) => {
          const total = despesas.filter((d) => d.categoria === cat).reduce((a, b) => a + b.valor, 0)
          return (
            <div key={cat} className="bg-white rounded-lg shadow p-3 text-center">
              <p className="text-xs uppercase text-gray-500">{cat}</p>
              <p className="text-lg font-bold mt-1">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Fornecedor</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{d.descricao}</td>
                <td className="p-3 text-right">R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-3">{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{d.categoria}</span></td>
                <td className="p-3">{d.fornecedor}</td>
                <td className="p-3 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-xs mr-2" onClick={() => abrirEdicao(d)}>Editar</button>
                  <button className="text-red-600 hover:text-red-800 text-xs" onClick={() => deletar(d.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal aberto={modalAberto} titulo={editando ? 'Editar Despesa' : 'Nova Despesa'} onFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-sm" required value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input type="number" step="0.01" className="w-full border rounded px-3 py-2 text-sm" required value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" className="w-full border rounded px-3 py-2 text-sm" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="agua">Água</option>
                <option value="luz">Luz</option>
                <option value="folha">Folha</option>
                <option value="limpeza">Limpeza</option>
                <option value="manutencao">Manutenção</option>
                <option value="seguranca">Segurança</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
              <input type="text" className="w-full border rounded px-3 py-2 text-sm" required value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 text-sm border rounded hover:bg-gray-50" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
