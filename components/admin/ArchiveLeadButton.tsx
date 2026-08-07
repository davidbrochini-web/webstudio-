'use client'

import { useState, useTransition } from 'react'
import { archiveLeadPotencial } from '@/app/admin/crm/actions'

export default function ArchiveLeadButton({ id }: { id: string }) {
  const [confirmando, setConfirmando] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleClick() {
    if (!confirmando) {
      setConfirmando(true)
      return
    }
    setErro(null)
    startTransition(async () => {
      try {
        await archiveLeadPotencial(id)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao arquivar.')
        setConfirmando(false)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        onBlur={() => setConfirmando(false)}
        disabled={pending}
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-60 ${
          confirmando
            ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-[var(--off)] text-[var(--muted)] border-[var(--border)] hover:border-red-200 hover:text-red-500'
        }`}
      >
        {pending ? 'Arquivando...' : confirmando ? 'Confirmar arquivar?' : 'Arquivar'}
      </button>
      {erro && <p className="text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}
