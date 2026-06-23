'use client'

import { ReactNode } from 'react'

export default function Modal({
  aberto,
  titulo,
  onFechar,
  children,
}: {
  aberto: boolean
  titulo: string
  onFechar: () => void
  children: ReactNode
}) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onFechar} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            onClick={onFechar}
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
