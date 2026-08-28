'use client'

import { useState } from 'react'

export default function CopiarPixBotao({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // Sem permissão de clipboard (raro) — o campo de texto abaixo
      // já deixa o código selecionável manualmente.
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <button
        onClick={copiar}
        className="text-sm font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90 flex-shrink-0"
        style={{ background: 'var(--dj-primary, #0EA5A0)' }}
      >
        {copiado ? '✓ Copiado!' : '📋 Copiar código Pix'}
      </button>
      <input
        readOnly
        value={codigo}
        onFocus={e => e.currentTarget.select()}
        className="flex-1 min-w-0 text-[11px] font-mono text-amber-800 bg-white border border-amber-200 rounded-full px-4 py-2 truncate"
      />
    </div>
  )
}
