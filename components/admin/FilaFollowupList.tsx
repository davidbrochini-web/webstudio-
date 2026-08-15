'use client'

import { useState, useTransition } from 'react'
import { marcarFollowupEnviado, type FilaFollowupItem } from '@/app/admin/crm/inteligencia-actions'

const MOMENTO_LABELS: Record<string, string> = {
  followup_1: '24h sem resposta',
  followup_2: '3 dias sem resposta',
  followup_3: '7 dias sem resposta',
  resgate: '15 dias sem resposta',
  pos_proposta: '48h após proposta',
}

const MOMENTO_CORES: Record<string, string> = {
  followup_1: 'bg-amber-50 text-amber-700 border-amber-200',
  followup_2: 'bg-orange-50 text-orange-700 border-orange-200',
  followup_3: 'bg-red-50 text-red-600 border-red-200',
  resgate: 'bg-gray-100 text-gray-500 border-gray-200',
  pos_proposta: 'bg-purple-50 text-purple-700 border-purple-200',
}

function diasSemResposta(iso: string | null): string {
  if (!iso) return '—'
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (dias === 0) return 'hoje mesmo'
  if (dias === 1) return '1 dia'
  return `${dias} dias`
}

export default function FilaFollowupList({ itens }: { itens: FilaFollowupItem[] }) {
  const [ocultos, setOcultos] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()
  const [copiadoId, setCopiadoId] = useState<string | null>(null)

  function handleMarcarEnviado(leadId: string) {
    startTransition(async () => {
      await marcarFollowupEnviado(leadId)
      setOcultos(s => new Set(s).add(leadId))
    })
  }

  function copiar(leadId: string, texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(leadId)
      setTimeout(() => setCopiadoId(null), 1500)
    })
  }

  const visiveis = itens.filter(i => !ocultos.has(i.leadId))

  if (visiveis.length === 0) {
    return (
      <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nada pendente por hoje</p>
        <p className="text-[var(--muted)] text-sm">Todos os leads em aberto foram contatados dentro do prazo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {visiveis.map(item => {
        const textoParaCopiar = item.template?.trim() || item.textoEnvio || ''
        return (
          <div key={item.leadId} className="bg-white border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-[var(--ink)] text-sm">{item.nome}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${MOMENTO_CORES[item.momento] ?? ''}`}>
                    {MOMENTO_LABELS[item.momento] ?? item.momento}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {item.telefone ?? 'sem telefone'} · esperando há {diasSemResposta(item.ultimaMsgRecebidaEm)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => copiar(item.leadId, textoParaCopiar)}
                  disabled={!textoParaCopiar}
                  className="text-xs font-semibold text-[var(--brand)] disabled:text-[var(--muted)] disabled:cursor-default"
                >
                  {copiadoId === item.leadId ? '✓ copiado' : 'copiar texto'}
                </button>
                <button
                  onClick={() => handleMarcarEnviado(item.leadId)}
                  disabled={pending}
                  className="text-xs font-semibold text-white bg-[var(--dark)] px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  Marcar enviado
                </button>
              </div>
            </div>

            {textoParaCopiar ? (
              <p className="text-xs text-[var(--ink)] bg-[var(--off)] rounded-lg px-3 py-2 mt-2.5">{textoParaCopiar}</p>
            ) : (
              <p className="text-xs text-amber-600 mt-2.5">
                Sem template pra &quot;{MOMENTO_LABELS[item.momento] ?? item.momento}&quot; ainda — escreva um abaixo, ou use o
                &quot;texto a enviar&quot; do card do lead.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
