'use client'

import { useState, useTransition } from 'react'
import { updateSuporteStatus } from '@/app/admin/suporte/actions'

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
}

const STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-red-50 text-red-600 border-red-200',
  em_andamento: 'bg-amber-50 text-amber-700 border-amber-200',
  resolvido: 'bg-green-50 text-green-700 border-green-200',
}

export default function SuporteStatusSelect({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(novoStatus: string) {
    const anterior = current
    setCurrent(novoStatus)
    setErro(null)
    startTransition(async () => {
      try {
        await updateSuporteStatus(id, novoStatus)
      } catch (err) {
        setCurrent(anterior)
        setErro(err instanceof Error ? err.message : 'Erro ao atualizar status.')
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={current}
        disabled={pending}
        onChange={e => handleChange(e.target.value)}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer disabled:opacity-60 ${STATUS_COLORS[current] ?? ''}`}
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {erro && <p className="text-[10px] text-red-500">{erro}</p>}
    </div>
  )
}
