'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchUnidades, fetchPerfilUnidades } from '@/lib/api'
import GraficoCluster from '@/components/GraficoCluster'
import Modal from '@/components/Modal'

const API = 'http://localhost:3001/api'

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<any[]>([])
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtroBloco, setFiltroBloco] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [form, setForm] = useState({ numero: '', bloco: 'A', proprietario: '', email: '' })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filtroBloco) params.bloco = filtroBloco
    try {
      const [u, p] = await Promise.all([fetchUnidades(), fetchPerfilUnidades(params)])
      let dados = p?.unidades || []
      if (filtroPerfil) dados = dados.filter((x: any) => x.perfil === filtroPerfil)
      setUnidades(u)
      setPerfil({ ...p, unidades: dados })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filtroBloco, filtroPerfil])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriacao() {
    setEditando(null)
    setForm({ numero: '', bloco: 'A', proprietario: '', email: '' })
    setModalAberto(true)
  }

  function abrirEdicao(u: any) {
    setEditando(u)
    setForm({ numero: u.numero, bloco: u.bloco, proprietario: u.proprietario, email: u.email })
    setModalAberto(true)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      if (editando) {
        await fetch(`${API}/unidades/${editando.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
      } else {
        await fetch(`${API}/unidades`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
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
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return
    await fetch(`${API}/unidades/${id}`, { method: 'DELETE' })
    await carregar()
  }

  if (loading) return <p className="text-center py-20">Carregando...</p>

  const blocos = Array.from(new Set((perfil?.unidades || []).map((u: any) => u.unidade.bloco))) as string[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Unidades</h1>
        <button className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 transition-colors" onClick={abrirCriacao}>
          + Nova Unidade
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroBloco}
          onChange={(e) => setFiltroBloco(e.target.value)}
        >
          <option value="">Todos os blocos</option>
          {blocos.map((b) => (
            <option key={b} value={b}>Bloco {b}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-1.5 text-sm"
          value={filtroPerfil}
          onChange={(e) => setFiltroPerfil(e.target.value)}
        >
          <option value="">Todos os perfis</option>
          <option value="Exemplar">Exemplar</option>
          <option value="Ocasional">Ocasional</option>
          <option value="Crítico">Crítico</option>
        </select>
      </div>

      {perfil?.erro && (
        <p className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">{perfil.erro}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Cluster por Perfil de Pagamento</h2>
          <GraficoCluster
            unidades={perfil?.unidades || []}
            silhueta={perfil?.silhuetaMedia}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Distribuição dos Clusters</h2>
          {perfil?.unidades ? (
            <div className="space-y-3">
              {['Exemplar', 'Ocasional', 'Crítico'].map((nome) => {
                const qtd = perfil.unidades.filter(
                  (u: any) => u.perfil === nome
                ).length
                const pct = ((qtd / perfil.unidades.length) * 100).toFixed(0)
                return (
                  <div key={nome}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{nome}</span>
                      <span className="font-medium">{qtd} ({pct}%)</span>
                    </div>
                    <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          nome === 'Exemplar' ? 'bg-green-500' :
                          nome === 'Ocasional' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {perfil.silhuetaMedia !== null && (
                <p className="text-xs text-gray-500 mt-4">
                  Coeficiente de Silhueta: {perfil.silhuetaMedia}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Sem dados.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Unidade</th>
              <th className="p-3 text-left">Bloco</th>
              <th className="p-3 text-left">Proprietário</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Perfil</th>
              <th className="p-3 text-right">Pontualidade</th>
              <th className="p-3 text-right">Atraso Médio</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(perfil?.unidades || []).map((u: any, i: number) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.unidade.numero}</td>
                <td className="p-3">{u.unidade.bloco}</td>
                <td className="p-3">{u.unidade.proprietario}</td>
                <td className="p-3 text-xs text-gray-500">{u.unidade.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.perfil === 'Exemplar' ? 'bg-green-100 text-green-700' :
                    u.perfil === 'Crítico' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {u.perfil}
                  </span>
                </td>
                <td className="p-3 text-right">{u.pontualidade.toFixed(0)}%</td>
                <td className="p-3 text-right">{u.atrasoMedio.toFixed(1)} dias</td>
                <td className="p-3 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-xs mr-2" onClick={() => abrirEdicao(u.unidade)}>Editar</button>
                  <button className="text-red-600 hover:text-red-800 text-xs" onClick={() => deletar(u.unidade.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal aberto={modalAberto} titulo={editando ? 'Editar Unidade' : 'Nova Unidade'} onFechar={() => setModalAberto(false)}>
        <form onSubmit={salvar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input type="text" className="w-full border rounded px-3 py-2 text-sm" required value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bloco</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.bloco} onChange={(e) => setForm({ ...form, bloco: e.target.value })}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário</label>
            <input type="text" className="w-full border rounded px-3 py-2 text-sm" required value={form.proprietario} onChange={(e) => setForm({ ...form, proprietario: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 text-sm" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
