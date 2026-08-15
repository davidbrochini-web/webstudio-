'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { enviarMensagemSimulada, getMensagensSimuladas, type MensagemSimulada } from '@/app/admin/crm/inteligencia-actions'

export default function LeadWhatsappSimulador({
  leadId,
  nome,
  telefone,
  onEnviado,
}: {
  leadId: string
  nome: string
  telefone: string | null
  onEnviado: () => void
}) {
  const [mensagens, setMensagens] = useState<MensagemSimulada[]>([])
  const [carregando, setCarregando] = useState(true)
  const [direcao, setDirecao] = useState<'enviada' | 'recebida'>('recebida')
  const [texto, setTexto] = useState('')
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  const carregar = useCallback(() => {
    getMensagensSimuladas(leadId)
      .then(setMensagens)
      .catch(err => setErro(err instanceof Error ? err.message : 'Erro ao carregar mensagens.'))
      .finally(() => setCarregando(false))
  }, [leadId])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'nearest' })
  }, [mensagens.length])

  function handleEnviar() {
    if (!texto.trim()) return
    setErro(null)
    const textoEnviado = texto
    startTransition(async () => {
      try {
        await enviarMensagemSimulada(leadId, direcao, textoEnviado)
        setTexto('')
        carregar()
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
    <div className="flex flex-col h-full min-h-0 bg-[#e5ddd5]">
      {/* Cabeçalho estilo WhatsApp Web */}
      <div className="flex items-center gap-3 bg-[#f0f2f5] border-b border-[var(--border)] px-4 py-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-[var(--dark)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--ink)] truncate">{nome}</p>
          <p className="text-[11px] text-[var(--muted)]">{telefone ?? 'sem telefone'} · simulado (sem ZAP-API ainda)</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
        {carregando && <p className="text-center text-xs text-gray-500 py-6">Carregando conversa...</p>}
        {!carregando && mensagens.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-10">
            Nenhuma mensagem ainda. Digite abaixo simulando o cliente ou o atendente pra ver a análise rodando ao vivo.
          </p>
        )}
        {mensagens.map(m => (
          <div key={m.id} className={`flex ${m.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                m.direcao === 'enviada' ? 'bg-[#dcf8c6] text-[var(--ink)]' : 'bg-white text-[var(--ink)]'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{m.texto}</p>
              <p className="text-[10px] text-gray-400 text-right mt-0.5">
                {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={fimRef} />
      </div>

      {/* Barra de envio */}
      <div className="bg-[#f0f2f5] border-t border-[var(--border)] p-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">Enviar como:</span>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setDirecao('recebida')}
              className={`text-[11px] font-bold px-2.5 py-1 transition-colors ${
                direcao === 'recebida' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setDirecao('enviada')}
              className={`text-[11px] font-bold px-2.5 py-1 transition-colors ${
                direcao === 'enviada' ? 'bg-[var(--dark)] text-white' : 'bg-white text-[var(--muted)]'
              }`}
            >
              Atendente
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={pending}
            autoFocus
            placeholder={direcao === 'recebida' ? 'Digite como se fosse o cliente...' : 'Digite como se fosse o atendente...'}
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-full border border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--brand)] disabled:opacity-60"
          />
          <button
            onClick={handleEnviar}
            disabled={pending || !texto.trim()}
            className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
            title="Enviar"
          >
            ➤
          </button>
        </div>
        {erro && <p className="text-[10px] text-red-500 mt-1.5">{erro}</p>}
      </div>
    </div>
  )
}
