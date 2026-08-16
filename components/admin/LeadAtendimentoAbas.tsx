'use client'

import { useState } from 'react'
import LeadCrmInteligencia from '@/components/admin/LeadCrmInteligencia'
import LeadFaqPanel from '@/components/admin/LeadFaqPanel'
import LeadHistorico from '@/components/admin/LeadHistorico'
import LeadMateriaisCompacto, { type ResponsavelInfo } from '@/components/admin/LeadMateriaisCompacto'

type Aba = 'analise' | 'faq' | 'proposta' | 'historico'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'analise', label: '🧠 Análise' },
  { id: 'faq', label: '❓ FAQ' },
  { id: 'proposta', label: '📎 Proposta' },
  { id: 'historico', label: '🕓 Histórico' },
]

export default function LeadAtendimentoAbas({
  leadId,
  refreshSignal,
  onDadosChange,
  onEnviarParaSimulador,
  responsavelAtual,
  notas,
  textoEnvio,
  analisePdfUrl,
  propostaPdfUrl,
  logoUrl,
  imagensPortfolio,
  homeMockupUrl,
  demoLinkInicial,
  demoNichoInicial,
}: {
  leadId: string
  refreshSignal: number
  onDadosChange: (temEscalonamento: boolean) => void
  onEnviarParaSimulador: (texto: string) => Promise<void>
  responsavelAtual: ResponsavelInfo | null
  notas: string | null
  textoEnvio: string | null
  analisePdfUrl: string | null
  propostaPdfUrl: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
  homeMockupUrl: string | null
  demoLinkInicial: string | null
  demoNichoInicial: string | null
}) {
  const [abaAtiva, setAbaAtiva] = useState<Aba>('proposta')

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Barra de abas */}
      <div className="flex items-center border-b border-[var(--border)] px-2 flex-shrink-0">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`text-xs font-bold px-3 py-2.5 border-b-2 transition-colors ${
              abaAtiva === aba.id
                ? 'border-[var(--brand)] text-[var(--ink)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {/* Mantém montado (display:none) em vez de desmontar, pra não perder estado/carregar de novo ao trocar de aba */}
        <div style={{ display: abaAtiva === 'analise' ? 'block' : 'none' }}>
          <LeadCrmInteligencia leadId={leadId} refreshSignal={refreshSignal} onDadosChange={onDadosChange} />
        </div>
        <div style={{ display: abaAtiva === 'faq' ? 'block' : 'none' }}>
          <LeadFaqPanel leadId={leadId} />
        </div>
        <div style={{ display: abaAtiva === 'proposta' ? 'block' : 'none' }}>
          <LeadMateriaisCompacto
            id={leadId}
            onEnviarParaSimulador={onEnviarParaSimulador}
            responsavelAtual={responsavelAtual}
            notas={notas}
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
        <div style={{ display: abaAtiva === 'historico' ? 'block' : 'none' }}>
          <LeadHistorico leadId={leadId} />
        </div>
      </div>
    </div>
  )
}
