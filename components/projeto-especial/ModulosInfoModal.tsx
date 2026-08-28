'use client'

import { useState } from 'react'
import { MODULOS_DISPONIVEIS_CLIENTE } from '@/lib/assinatura'

export default function ModulosInfoModal() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="cursor-pointer text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-2 whitespace-nowrap"
      >
        O que é cada módulo?
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100">
              <p className="font-display font-bold text-slate-800">O que é cada módulo</p>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="cursor-pointer text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 sm:px-8 py-6 flex flex-col gap-5">
              {MODULOS_DISPONIVEIS_CLIENTE.map(m => (
                <div key={m.label} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{m.icone}</span>
                  <div>
                    <p className="font-bold text-sm text-slate-800 mb-0.5">{m.label}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{m.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
