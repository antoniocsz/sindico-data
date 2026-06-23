'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchReceitas, fetchUnidades } from '@/lib/api'
import Modal from '@/components/Modal'

const API = 'http://localhost:3001/api'

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<any[]>([])
  const [unidades, setUnidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroUnidade, setFiltroUnidade] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState({
    descricao: '', valor: '', dataVencimento: '', dataPagamento: '',
    unidadeId: '', categoria: 'condominio', status: 'pendente',
  })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroStatus) params.status = filtroStatus
    if (filtroUnidade) params.unidadeId = filtroUnidade
    if (filtroMes) {
      const [ano, mes] = filtroMes.split('-')
      params.mesInicio = new Date(Number(ano), Number(mes) - 1, 1).toISOString()
      params.mesFim = new Date(Number(ano), Number(mes), 0).toISOString()
    }
    try {
      const [r, u] = await Promise.all([fetchReceitas(params), fetchUnidades()])
      setReceitas(r)
      setUnidades(u)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroStatus, filtroUnidade, filtroMes])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriacao() {
    setEditando(null)
    setForm({ descricao: '', valor: '', dataVencimento: '', dataPagamento: '', unidadeId: '', categoria: 'condominio', status: 'pendente' })
    setModalAberto(true)
  }

  function abrirEdicao(r: any) {
    setEditando(r)
    setForm({
      descricao: r.descricao,
      valor: String(r.valor),
      dataVencimento: r.dataVencimento.slice(0, 10),
      dataPagamento: r.dataPagamento ? r.dataPagamento.slice(0, 10) : '',
      unidadeId: String(r.unidadeId),
      categoria: r.categoria,
      status: r.status,
    })
    setModalAberto(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const body: Record<string, any> = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      dataVencimento: form.dataVencimento,
      unidadeId: Number(form.unidadeId),
      categoria: form.categoria,
      status: form.status,
    }
    if (form.dataPagamento) body.dataPagamento = form.dataPagamento
    try {
      if (editando) {
        await fetch(`${API}/receitas/${editando.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        await fetch(`${API}/receitas`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
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
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return
    await fetch(`${API}/receitas/${id}`, { method: 'DELETE' })
    await carregar()
  }

  if (loading) return <p className="text-center py-20">Carregando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 transition-colors"
          onClick={abrirCriacao}
        >
          + Nova Receita
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="border rounded px-3 py-1.5 text-sm" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado</option>
        </select>
        <select className="border rounded px-3 py-1.5 text-sm" value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}>
          <option value="">Todas as unidades</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>{u.numero}-{u.bloco}</option>
          ))}
        </select>
        <input type="month" className="border rounded px-3 py-1.5 text-sm" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-left">Unidade</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-left">Vencimento</th>
              <th className="p-3 text-left">Pagamento</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {receitas.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.descricao}</td>
                <td className="p-3">{r.unidade?.numero}-{r.unidade?.bloco}</td>
                <td className="p-3 text-right">R$ {r.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-3">{new Date(r.dataVencimento).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{r.dataPagamento ? new Date(r.dataPagamento).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'pago' ? 'bg-green-100 text-green-700' :
                    r.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{r.status}</span>
                </td>
                <td className="p-3 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-xs mr-2" onClick={() => abrirEdicao(r)}>Editar</button>
                  <button className="text-red-600 hover:text-red-800 text-xs" onClick={() => deletar(r.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal aberto={modalAberto} titulo={editando ? 'Editar Receita' : 'Nova Receita'} onFechar={() => setModalAberto(false)}>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select className="w-full border rounded px-3 py-2 text-sm" required value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}>
                <option value="">Selecione</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.numero}-{u.bloco} ({u.proprietario})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
              <input type="date" className="w-full border rounded px-3 py-2 text-sm" required value={form.dataVencimento} onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
              <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={form.dataPagamento} onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="condominio">Condomínio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
              </select>
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
