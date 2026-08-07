'use client'

import { useMemo, useState } from 'react'
import LeadPotencialRow, { type LeadPotencialRowData } from '@/components/admin/LeadPotencialRow'

export default function LeadsPotenciaisList({ leads }: { leads: LeadPotencialRowData[] }) {
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return leads
    return leads.filter(l =>
      l.nome.toLowerCase().includes(termo) ||
      l.segmento?.toLowerCase().includes(termo) ||
      l.email?.toLowerCase().includes(termo) ||
      l.telefone?.toLowerCase().includes(termo)
    )
  }, [leads, busca])

  return (
    <div>
      {leads.length > 5 && (
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, segmento, telefone ou e-mail..."
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--brand)] mb-4"
        />
      )}

      {!filtrados.length ? (
        <p className="text-sm text-[var(--muted)] text-center py-10">Nenhum lead encontrado pra &ldquo;{busca}&rdquo;.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map(lead => <LeadPotencialRow key={lead.id} lead={lead} />)}
        </div>
      )}
    </div>
  )
}
