'use client'

import { useState, useTransition } from 'react'
import { updateLeadResponsavel } from '@/app/admin/crm/actions'

export interface Membro {
  id: string
  nome: string
}

export default function ResponsavelSelect({
  id,
  responsavelId,
  membros,
}: {
  id: string
  responsavelId: string | null
  membros: Membro[]
}) {
  const [current, setCurrent] = useState(responsavelId ?? '')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(novoId: string) {
    const anterior = current
    setCurrent(novoId)
    setErro(null)
    startTransition(async () => {
      try {
        await updateLeadResponsavel(id, novoId || null)
      } catch (err) {
        setCurrent(anterior)
        setErro(err instanceof Error ? err.message : 'Erro ao atribuir.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={current}
        disabled={pending}
        onChange={e => handleChange(e.target.value)}
        className="text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--border)] bg-white text-[var(--ink)] outline-none cursor-pointer disabled:opacity-60"
      >
        <option value="">Sem responsável</option>
        {membros.map(m => (
          <option key={m.id} value={m.id}>{m.nome}</option>
        ))}
      </select>
      {erro && <p className="text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}
