'use client'

import { useState } from 'react'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import ArchiveLeadButton from '@/components/admin/ArchiveLeadButton'
import ResponsavelSelect, { type Membro } from '@/components/admin/ResponsavelSelect'
import LeadAtendimentoModal from '@/components/admin/LeadAtendimentoModal'

export interface LeadPotencialRowData {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  segmento: string | null
  bairro: string | null
  endereco: string | null
  notaGoogle: number | null
  avaliacoesGoogle: number | null
  notas: string | null
  texto_envio: string | null
  analise_pdf_url: string | null
  proposta_pdf_url: string | null
  propostaGeradaEm: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
  status: string
  created_at: string
  criadorNome: string | null
  responsavelId: string | null
  demoLink: string | null
  demoNicho: string | null
}

export default function LeadPotencialRow({ lead, membros }: { lead: LeadPotencialRowData; membros: Membro[] }) {
  const [atendimentoAberto, setAtendimentoAberto] = useState(false)

  const temAnalise = Boolean(lead.analise_pdf_url)
  const temProposta = Boolean(lead.proposta_pdf_url)

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="w-full flex items-center gap-4 p-4 hover:bg-[var(--off)] transition-colors">
        <button onClick={() => setAtendimentoAberto(true)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[var(--ink)] text-sm truncate">{lead.nome}</p>
              {lead.segmento && (
                <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--off)] px-2 py-0.5 rounded-full flex-shrink-0">
                  {lead.segmento}
                </span>
              )}
              {lead.bairro && (
                <span className="text-[10px] font-semibold text-[var(--brand)] bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  📍 {lead.bairro}
                </span>
              )}
              {lead.notaGoogle != null && (
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  ⭐ {lead.notaGoogle} ({lead.avaliacoesGoogle ?? 0})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 text-xs text-[var(--muted)] mt-0.5">
              {lead.telefone && <span>{lead.telefone}</span>}
              {lead.email && <span className="truncate">{lead.email}</span>}
              {lead.endereco && <span>📍 {lead.endereco}</span>}
              <span>Cadastrado por {lead.criadorNome ?? 'alguém da equipe'} · {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            </div>
          </div>
        </button>

        {/* Indicador rápido de PDFs, sem precisar abrir */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0" title="Documentos">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${temAnalise ? 'bg-green-50 text-[var(--brand)]' : 'bg-[var(--off)] text-[var(--muted)]'}`}>
            Análise
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${temProposta ? 'bg-green-50 text-[var(--brand)]' : 'bg-amber-50 text-amber-700'}`}
            title={lead.propostaGeradaEm ? `Gerada em ${new Date(lead.propostaGeradaEm).toLocaleDateString('pt-BR')}` : undefined}
          >
            {temProposta ? '✓ Proposta' : 'Proposta pendente'}
          </span>
        </div>

        <button
          onClick={() => setAtendimentoAberto(true)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-[var(--brand)] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          💬 Simular atendimento
        </button>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <LeadStatusSelect id={lead.id} status={lead.status} />
          <ResponsavelSelect id={lead.id} responsavelId={lead.responsavelId} membros={membros} />
        </div>

        <ArchiveLeadButton id={lead.id} />
      </div>

      {atendimentoAberto && (
        <LeadAtendimentoModal
          leadId={lead.id}
          nome={lead.nome}
          telefone={lead.telefone}
          status={lead.status}
          responsavelId={lead.responsavelId}
          membros={membros}
          notas={lead.notas}
          textoEnvio={lead.texto_envio}
          analisePdfUrl={lead.analise_pdf_url}
          propostaPdfUrl={lead.proposta_pdf_url}
          logoUrl={lead.logoUrl}
          imagensPortfolio={lead.imagensPortfolio}
          demoLinkInicial={lead.demoLink}
          demoNichoInicial={lead.demoNicho}
          onClose={() => setAtendimentoAberto(false)}
        />
      )}
    </div>
  )
}
