'use client'

import { useState } from 'react'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import ArchiveLeadButton from '@/components/admin/ArchiveLeadButton'
import LeadPotencialCard from '@/components/admin/LeadPotencialCard'

export interface LeadPotencialRowData {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  segmento: string | null
  notas: string | null
  texto_envio: string | null
  analise_pdf_url: string | null
  proposta_pdf_url: string | null
  status: string
  created_at: string
  criadorNome: string | null
}

export default function LeadPotencialRow({ lead }: { lead: LeadPotencialRowData }) {
  const [aberto, setAberto] = useState(false)

  const temAnalise = Boolean(lead.analise_pdf_url)
  const temProposta = Boolean(lead.proposta_pdf_url)

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Linha compacta — sempre visível */}
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--off)] transition-colors"
      >
        <span className={`text-[var(--muted)] text-xs flex-shrink-0 transition-transform ${aberto ? 'rotate-90' : ''}`}>▶</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[var(--ink)] text-sm truncate">{lead.nome}</p>
            {lead.segmento && (
              <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--off)] px-2 py-0.5 rounded-full flex-shrink-0">
                {lead.segmento}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)] mt-0.5">
            {lead.telefone && <span>{lead.telefone}</span>}
            {lead.email && <span className="truncate">{lead.email}</span>}
            <span>Cadastrado por {lead.criadorNome ?? 'alguém da equipe'} · {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>

        {/* Indicador rápido de PDFs, sem precisar abrir */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" title="Documentos">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${temAnalise ? 'bg-green-50 text-[var(--brand)]' : 'bg-[var(--off)] text-[var(--muted)]'}`}>
            Análise
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${temProposta ? 'bg-green-50 text-[var(--brand)]' : 'bg-[var(--off)] text-[var(--muted)]'}`}>
            Proposta
          </span>
        </div>

        <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
          <LeadStatusSelect id={lead.id} status={lead.status} />
        </div>
      </button>

      {aberto && (
        <div className="px-5 pb-5">
          <div className="flex justify-end mb-2">
            <ArchiveLeadButton id={lead.id} />
          </div>
          <LeadPotencialCard
            id={lead.id}
            notas={lead.notas}
            textoEnvio={lead.texto_envio}
            analisePdfUrl={lead.analise_pdf_url}
            propostaPdfUrl={lead.proposta_pdf_url}
          />
        </div>
      )}
    </div>
  )
}
