'use client'

import { useEffect, useRef, useState } from 'react'
import LeadAtendimentoAbas from '@/components/admin/LeadAtendimentoAbas'
import LeadWhatsappSimulador, { type LeadWhatsappSimuladorHandle } from '@/components/admin/LeadWhatsappSimulador'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import ResponsavelSelect, { type Membro } from '@/components/admin/ResponsavelSelect'
import LeadEditarModal from '@/components/admin/LeadEditarModal'
import type { LeadDadosCompletos } from '@/app/admin/crm/actions'

export default function LeadAtendimentoModal({
  leadId,
  nome,
  telefone,
  email,
  segmento,
  bairro,
  endereco,
  siteAtualUrl,
  instagramUrl,
  status,
  responsavelId,
  membros,
  notas,
  textoEnvio,
  analisePdfUrl,
  propostaPdfUrl,
  logoUrl,
  imagensPortfolio,
  homeMockupUrl,
  demoLinkInicial,
  demoNichoInicial,
  onClose,
}: {
  leadId: string
  nome: string
  telefone: string | null
  email: string | null
  segmento: string | null
  bairro: string | null
  endereco: string | null
  siteAtualUrl: string | null
  instagramUrl: string | null
  status: string
  responsavelId: string | null
  membros: Membro[]
  notas: string | null
  textoEnvio: string | null
  analisePdfUrl: string | null
  propostaPdfUrl: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
  homeMockupUrl: string | null
  demoLinkInicial: string | null
  demoNichoInicial: string | null
  onClose: () => void
}) {
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [temEscalonamento, setTemEscalonamento] = useState(false)
  const [editarAberto, setEditarAberto] = useState(false)
  const [dadosLead, setDadosLead] = useState<LeadDadosCompletos>({
    nome, telefone, email, segmento, bairro, endereco,
    siteAtualUrl, instagramUrl, notas,
  })
  const simuladorRef = useRef<LeadWhatsappSimuladorHandle>(null)

  async function handleEnviarParaSimulador(texto: string) {
    await simuladorRef.current?.enviarTextoExterno(texto)
  }

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
        className="bg-[var(--card-bg)] rounded-2xl w-full max-w-7xl h-full sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="font-display font-bold text-[var(--ink)] text-base truncate">{dadosLead.nome}</p>
            <button
              onClick={() => setEditarAberto(true)}
              className="text-[10px] font-bold text-[var(--muted)] hover:text-[var(--brand)] bg-[var(--off)] hover:bg-green-50 border border-[var(--border)] px-2 py-0.5 rounded-full flex-shrink-0 transition-colors"
            >
              ✏️ Editar cliente
            </button>
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

        {/* Corpo: coluna estreita de abas + WhatsApp dominante */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* Coluna esquerda: abas (Análise / FAQ / Proposta / Histórico) */}
          <div className="min-h-0">
            <LeadAtendimentoAbas
              leadId={leadId}
              refreshSignal={refreshSignal}
              onDadosChange={setTemEscalonamento}
              onEnviarParaSimulador={handleEnviarParaSimulador}
              notas={dadosLead.notas}
              textoEnvio={textoEnvio}
              analisePdfUrl={analisePdfUrl}
              propostaPdfUrl={propostaPdfUrl}
              logoUrl={logoUrl}
              homeMockupUrl={homeMockupUrl}
              imagensPortfolio={imagensPortfolio}
              demoLinkInicial={demoLinkInicial}
              demoNichoInicial={demoNichoInicial}
            />
          </div>

          {/* Coluna direita: WhatsApp dominante, conversa só desse cliente */}
          <div className="min-h-0 flex flex-col">
            <LeadWhatsappSimulador
              ref={simuladorRef}
              leadId={leadId}
              nome={dadosLead.nome}
              telefone={dadosLead.telefone}
              onEnviado={() => setRefreshSignal(s => s + 1)}
            />
          </div>
        </div>

        {editarAberto && (
          <LeadEditarModal
            leadId={leadId}
            dadosIniciais={dadosLead}
            onClose={() => setEditarAberto(false)}
            onSalvo={setDadosLead}
          />
        )}
      </div>
    </div>
  )
}
