'use client'

import { useState } from 'react'
import { formatCentavos } from '@/lib/assinatura'

export default function PixPendenteBotao({
  totalCentavos,
  qrDataUrl,
  codigo,
}: {
  totalCentavos: number
  qrDataUrl: string
  codigo: string
}) {
  const [aberto, setAberto] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // campo abaixo já deixa o código selecionável manualmente
    }
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex-shrink-0 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-full px-3.5 py-2 transition-colors whitespace-nowrap animate-pulse"
      >
        {formatCentavos(totalCentavos)} pendente · Pix
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <p className="font-display font-bold text-slate-800">Pagamento pendente</p>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-6 flex flex-col items-center text-center">
              <p className="text-sm text-slate-500 mb-1">Total pendente</p>
              <p className="font-display font-extrabold text-3xl text-slate-800 mb-5">{formatCentavos(totalCentavos)}</p>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR Code Pix" className="w-44 h-44 rounded-lg border border-slate-200 mb-5" />

              <p className="text-xs text-slate-500 mb-4">
                Aponte a câmera do seu banco pro QR Code, ou copie o código abaixo e cole no app do seu banco.
              </p>

              <button
                onClick={copiar}
                className="text-sm font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90 mb-3 w-full"
                style={{ background: 'var(--dj-primary, #0EA5A0)' }}
              >
                {copiado ? '✓ Copiado!' : '📋 Copiar código Pix'}
              </button>
              <input
                readOnly
                value={codigo}
                onFocus={e => e.currentTarget.select()}
                className="w-full text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 truncate text-center"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
