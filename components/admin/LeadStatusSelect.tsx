'use client'

import { useState, useTransition } from 'react'
import { updateLeadStatus } from '@/app/admin/crm/actions'

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  em_negociacao: 'Em negociação',
  sem_interesse: 'Sem interesse',
  convertido: 'Convertido',
  perdido: 'Perdido',
}

const STATUS_COLORS: Record<string, string> = {
  novo: 'bg-blue-50 text-blue-700 border-blue-200',
  contatado: 'bg-amber-50 text-amber-700 border-amber-200',
  em_negociacao: 'bg-purple-50 text-purple-700 border-purple-200',
  sem_interesse: 'bg-gray-100 text-gray-500 border-gray-200',
  convertido: 'bg-green-50 text-green-700 border-green-200',
  perdido: 'bg-red-50 text-red-600 border-red-200',
}

export default function LeadStatusSelect({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleChange(novoStatus: string) {
    const anterior = current
    setCurrent(novoStatus)
    setErro(null)
    startTransition(async () => {
      try {
        await updateLeadStatus(id, novoStatus)
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
