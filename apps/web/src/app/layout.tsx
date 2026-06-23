import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SAD Condomínios',
  description: 'Sistema de Apoio à Decisão para Gestão Financeira de Condomínios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="bg-blue-800 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              SAD Condomínios
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="hover:text-blue-200">Dashboard</Link>
              <Link href="/bi" className="hover:text-blue-200">BI</Link>
              <Link href="/receitas" className="hover:text-blue-200">Receitas</Link>
              <Link href="/despesas" className="hover:text-blue-200">Despesas</Link>
              <Link href="/unidades" className="hover:text-blue-200">Unidades</Link>
              <Link href="/inadimplencia" className="hover:text-blue-200">Inadimplência</Link>
              <Link href="/analise-preditiva" className="hover:text-blue-200">Análise Preditiva</Link>
              <Link href="/anomalias" className="hover:text-blue-200">Anomalias</Link>
              <Link href="/orcamentos" className="hover:text-blue-200">Orçamento</Link>
              <Link href="/simulacao" className="hover:text-blue-200">Simulação</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
