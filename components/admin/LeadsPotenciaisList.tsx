'use client'

import { useMemo, useState } from 'react'
import LeadPotencialRow, { type LeadPotencialRowData } from '@/components/admin/LeadPotencialRow'
import type { Membro } from '@/components/admin/ResponsavelSelect'

const STATUS_TABS = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'em_negociacao', label: 'Em negociação' },
  { value: 'sem_interesse', label: 'Sem interesse' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'todos', label: 'Todos' },
] as const

export default function LeadsPotenciaisList({ leads, membros }: { leads: LeadPotencialRowData[]; membros: Membro[] }) {
  const [busca, setBusca] = useState('')
  // Padrão: mostra só os "Novo" — é o que precisa de atenção primeiro.
  // Os outros status ficam a um clique, não escondidos.
  const [statusAtivo, setStatusAtivo] = useState<typeof STATUS_TABS[number]['value']>('novo')

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: leads.length }
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1
    return c
  }, [leads])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return leads.filter(l => {
      const passaStatus = statusAtivo === 'todos' || l.status === statusAtivo
      if (!passaStatus) return false
      if (!termo) return true
      return (
        l.nome.toLowerCase().includes(termo) ||
        l.segmento?.toLowerCase().includes(termo) ||
        l.bairro?.toLowerCase().includes(termo) ||
        l.email?.toLowerCase().includes(termo) ||
        l.telefone?.toLowerCase().includes(termo)
      )
    })
  }, [leads, busca, statusAtivo])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map(tab => {
          const ativo = statusAtivo === tab.value
          const qtd = contagem[tab.value] ?? 0
          return (
            <button
              key={tab.value}
              onClick={() => setStatusAtivo(tab.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                ativo
                  ? 'bg-[var(--dark)] text-white border-[var(--dark)]'
                  : 'bg-white text-[var(--muted)] border-[var(--border)] hover:border-[var(--brand)] hover:text-[var(--ink)]'
              }`}
            >
              {tab.label} <span className={ativo ? 'text-white/60' : 'text-[var(--muted)]'}>({qtd})</span>
            </button>
          )
        })}
      </div>

      {leads.length > 5 && (
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, segmento, bairro, telefone ou e-mail..."
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--brand)] mb-4"
        />
      )}

      {!filtrados.length ? (
        <p className="text-sm text-[var(--muted)] text-center py-10">
          {busca ? <>Nenhum lead encontrado pra &ldquo;{busca}&rdquo;.</> : 'Nenhum lead nesse status.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map(lead => <LeadPotencialRow key={lead.id} lead={lead} membros={membros} />)}
        </div>
      )}
    </div>
  )
}
