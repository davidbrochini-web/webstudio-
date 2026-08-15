'use client'

import { useEffect, useState } from 'react'
import LeadCrmInteligencia from '@/components/admin/LeadCrmInteligencia'
import LeadWhatsappSimulador from '@/components/admin/LeadWhatsappSimulador'
import LeadFaqPanel from '@/components/admin/LeadFaqPanel'
import LeadHistorico from '@/components/admin/LeadHistorico'
import LeadMateriaisCompacto from '@/components/admin/LeadMateriaisCompacto'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import ResponsavelSelect, { type Membro } from '@/components/admin/ResponsavelSelect'

export default function LeadAtendimentoModal({
  leadId,
  nome,
  telefone,
  status,
  responsavelId,
  membros,
  notas,
  textoEnvio,
  analisePdfUrl,
  propostaPdfUrl,
  logoUrl,
  imagensPortfolio,
  onClose,
}: {
  leadId: string
  nome: string
  telefone: string | null
  status: string
  responsavelId: string | null
  membros: Membro[]
  notas: string | null
  textoEnvio: string | null
  analisePdfUrl: string | null
  propostaPdfUrl: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
  onClose: () => void
}) {
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [temEscalonamento, setTemEscalonamento] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-7xl h-full sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="font-display font-bold text-[var(--ink)] text-base truncate">{nome}</p>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
              🧪 SIMULAÇÃO
            </span>
            {temEscalonamento && (
              <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full flex-shrink-0">🔔 ESCALAR</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <LeadStatusSelect id={leadId} status={status} />
            <ResponsavelSelect id={leadId} responsavelId={responsavelId} membros={membros} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-[var(--off)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center text-lg flex-shrink-0"
              title="Fechar (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo: coluna estreita de info + WhatsApp dominante */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* Coluna esquerda: CRM Inteligente (foco) + materiais compactos + FAQ + histórico */}
          <div className="min-h-0 overflow-y-auto p-4 flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide mb-3">CRM Inteligente</p>
              <LeadCrmInteligencia leadId={leadId} refreshSignal={refreshSignal} onDadosChange={setTemEscalonamento} />
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <LeadMateriaisCompacto
                id={leadId}
                notas={notas}
                textoEnvio={textoEnvio}
                analisePdfUrl={analisePdfUrl}
                propostaPdfUrl={propostaPdfUrl}
                logoUrl={logoUrl}
                imagensPortfolio={imagensPortfolio}
              />
            </div>

            <LeadFaqPanel leadId={leadId} />
            <LeadHistorico leadId={leadId} />
          </div>

          {/* Coluna direita: WhatsApp dominante, conversa só desse cliente */}
          <div className="min-h-0 flex flex-col">
            <LeadWhatsappSimulador
              leadId={leadId}
              nome={nome}
              telefone={telefone}
              onEnviado={() => setRefreshSignal(s => s + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
