'use client'

import { useState, useEffect } from 'react'
import { getLeadLog } from '@/app/admin/crm/actions'

interface LogEntry {
  id: string
  evento: string
  status_anterior: string | null
  status_novo: string | null
  detalhe: string | null
  criado_em: string
  autor: { nome: string } | { nome: string }[] | null
}

const STATUS_LABEL: Record<string, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  em_negociacao: 'Em negociação',
  sem_interesse: 'Sem interesse',
  convertido: 'Convertido',
  perdido: 'Perdido',
}

function descreverEvento(l: LogEntry): string {
  switch (l.evento) {
    case 'lead_criado':
      return 'Lead cadastrado'
    case 'status_alterado':
      return `Status: ${STATUS_LABEL[l.status_anterior ?? ''] ?? l.status_anterior ?? '—'} → ${STATUS_LABEL[l.status_novo ?? ''] ?? l.status_novo}`
    case 'proposta_gerada':
      return 'Proposta (PDF) gerada'
    case 'responsavel_alterado':
      return `Responsável definido: ${l.detalhe ?? '—'}`
    default:
      return l.evento
  }
}

export default function LeadHistorico({ leadId }: { leadId: string }) {
  const [carregando, setCarregando] = useState(true)
  const [log, setLog] = useState<LogEntry[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setCarregando(true)
    getLeadLog(leadId)
      .then(dados => setLog(dados as LogEntry[]))
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar histórico.'))
      .finally(() => setCarregando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId])

  return (
    <div className="flex flex-col gap-2">
      {carregando && <p className="text-xs text-[var(--muted)]">Carregando...</p>}
      {erro && <p className="text-xs text-red-500">{erro}</p>}
      {log?.length === 0 && <p className="text-xs text-[var(--muted)]">Sem eventos registrados.</p>}
      {log?.map(l => {
        const autor = Array.isArray(l.autor) ? l.autor[0] : l.autor
        const data = new Date(l.criado_em)
        return (
          <div key={l.id} className="flex items-start gap-2 text-xs">
            <span className="text-[var(--muted)] flex-shrink-0 w-28">
              {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[var(--ink)]">
              {descreverEvento(l)}
              {autor?.nome && <span className="text-[var(--muted)]"> · {autor.nome}</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}
