'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { enviarMensagemSimulada, type MensagemSimulada } from '@/app/admin/crm/inteligencia-actions'

export default function LeadWhatsappSimulador({
  leadId,
  mensagens,
  onEnviado,
}: {
  leadId: string
  mensagens: MensagemSimulada[]
  onEnviado: () => void
}) {
  const [direcao, setDirecao] = useState<'enviada' | 'recebida'>('recebida')
  const [texto, setTexto] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [ultimoResultado, setUltimoResultado] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensagens.length])

  function handleEnviar() {
    if (!texto.trim()) return
    setErro(null)
    setUltimoResultado(null)
    startTransition(async () => {
      try {
        const r = await enviarMensagemSimulada(leadId, direcao, texto)
        setTexto('')
        if (r && r.hits_novos > 0) {
          setUltimoResultado(`+${r.hits_novos} detecção${r.hits_novos > 1 ? 'ões' : ''}`)
        }
        onEnviado()
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao enviar.')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEnviar()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">
          Simulador de WhatsApp <span className="font-normal normal-case">(sem ZAP-API ainda — mensagens digitadas aqui)</span>
        </p>
        {ultimoResultado && <span className="text-[10px] font-semibold text-[var(--brand)]">{ultimoResultado}</span>}
      </div>

      <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[#e5ddd5]">
        <div className="max-h-64 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
          {mensagens.length === 0 && (
            <p className="text-center text-[11px] text-gray-500 py-6">Nenhuma mensagem simulada ainda.</p>
          )}
          {mensagens.map(m => (
            <div key={m.id} className={`flex ${m.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs shadow-sm ${
                  m.direcao === 'enviada' ? 'bg-[#dcf8c6] text-[var(--ink)]' : 'bg-white text-[var(--ink)]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                <p className="text-[9px] text-gray-400 text-right mt-0.5">
                  {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={fimRef} />
        </div>

        <div className="bg-[var(--off)] border-t border-[var(--border)] p-2 flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden flex-shrink-0">
            <button
              onClick={() => setDirecao('recebida')}
              className={`text-[10px] font-bold px-2 py-1.5 transition-colors ${
                direcao === 'recebida' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'
              }`}
              title="Simular mensagem do cliente"
            >
              Cliente
            </button>
            <button
              onClick={() => setDirecao('enviada')}
              className={`text-[10px] font-bold px-2 py-1.5 transition-colors ${
                direcao === 'enviada' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'
              }`}
              title="Simular mensagem do atendente"
            >
              Atendente
            </button>
          </div>
          <input
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={pending}
            placeholder={direcao === 'recebida' ? 'Digite como se fosse o cliente...' : 'Digite como se fosse o atendente...'}
            className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-xs outline-none focus:border-[var(--brand)] disabled:opacity-60"
          />
          <button
            onClick={handleEnviar}
            disabled={pending || !texto.trim()}
            className="text-xs font-semibold text-white bg-[var(--brand)] px-3 py-1.5 rounded-lg disabled:opacity-40 flex-shrink-0"
          >
            {pending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
      {erro && <p className="text-[10px] text-red-500 mt-1">{erro}</p>}
    </div>
  )
}
