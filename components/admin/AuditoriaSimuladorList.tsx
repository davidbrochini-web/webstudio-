'use client'

import { useState, useTransition } from 'react'
import { marcarAuditoriaResolvida, type AuditoriaSimulacaoItem } from '@/app/admin/crm/inteligencia-actions'
import { PERFIL_SIMULADO_LABELS, type PerfilSimulado } from '@/lib/crm-simulador-roteiros'

function AuditoriaCard({ item }: { item: AuditoriaSimulacaoItem }) {
  const [expandido, setExpandido] = useState(false)
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(item.status)

  function handleToggleResolvido() {
    const novoStatus = status === 'pendente' ? 'resolvido' : 'pendente'
    startTransition(async () => {
      const res = await marcarAuditoriaResolvida(item.id, novoStatus === 'resolvido')
      if (!res.error) setStatus(novoStatus)
    })
  }

  return (
    <div className={`bg-[var(--card-bg)] border rounded-2xl p-5 ${status === 'pendente' ? 'border-amber-200' : 'border-[var(--border)] opacity-70'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-[var(--ink)] text-sm truncate">{item.leadNome}</p>
            <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--off)] px-2 py-0.5 rounded-full flex-shrink-0">
              perfil {PERFIL_SIMULADO_LABELS[item.perfilSimulado as PerfilSimulado] ?? item.perfilSimulado}
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            {item.autorNome ?? 'alguém da equipe'} · {new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={handleToggleResolvido}
          disabled={pending}
          className={`flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
            status === 'resolvido'
              ? 'bg-green-50 text-[var(--brand)] border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {pending ? '...' : status === 'resolvido' ? '✓ Resolvido' : 'Marcar resolvido'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Problema</p>
          <p className="text-sm text-[var(--slate)] leading-relaxed">{item.problema}</p>
        </div>
        {item.solucaoSugerida && (
          <div>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Possível solução</p>
            <p className="text-sm text-[var(--slate)] leading-relaxed">{item.solucaoSugerida}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpandido(e => !e)}
        className="text-xs font-semibold text-[var(--brand)] underline underline-offset-2"
      >
        {expandido ? 'Esconder conversa' : `Ver conversa (${item.conversaSnapshot.length} mensagens)`}
      </button>

      {expandido && (
        <div className="mt-3 bg-[var(--off)] rounded-xl p-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {item.conversaSnapshot.length === 0 && (
            <p className="text-xs text-[var(--muted)]">Conversa vazia no momento do report.</p>
          )}
          {item.conversaSnapshot.map(m => (
            <div key={m.id} className={`flex ${m.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${
                m.direcao === 'enviada' ? 'bg-[#dcf8c6] text-[#0b1a12]' : 'bg-white text-[#111b21] border border-[var(--border)]'
              }`}>
                {m.texto}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AuditoriaSimuladorList({
  pendentes,
  resolvidas,
}: {
  pendentes: AuditoriaSimulacaoItem[]
  resolvidas: AuditoriaSimulacaoItem[]
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-3">
          Pendentes ({pendentes.length})
        </p>
        {pendentes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nenhuma pendência — tudo revisado.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendentes.map(item => <AuditoriaCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {resolvidas.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-3">
            Resolvidas ({resolvidas.length})
          </p>
          <div className="flex flex-col gap-3">
            {resolvidas.map(item => <AuditoriaCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  )
}
