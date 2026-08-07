'use client'

import { useState } from 'react'
import { submitLeadOmnidesign } from '@/lib/leads-omnidesign-actions'

/**
 * Formulário de contato do PRÓPRIO site da Omnidesign — alternativa
 * ao WhatsApp pra quem prefere preencher um formulário. Grava em
 * leads_omnidesign (origem='site'), visível só no admin (/admin/crm).
 * Não tem relação nenhuma com site_leads (dados dos clientes).
 */
export default function LeadFormOmnidesign() {
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !contato.trim()) {
      setErro('Preenche seu nome e um jeito de te responder (WhatsApp ou e-mail).')
      return
    }
    setErro(null)
    setSending(true)
    try {
      await submitLeadOmnidesign({ nome, contato, mensagem })
      setSent(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar. Tenta de novo.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl p-6 text-center max-w-md mx-auto">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-display font-bold text-white mb-1">Recebido!</p>
        <p className="text-sm text-white/70">Retornamos assim que possível.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 max-w-md mx-auto text-left">
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Seu nome"
        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 text-sm outline-none focus:border-white/50"
      />
      <input
        value={contato}
        onChange={e => setContato(e.target.value)}
        placeholder="WhatsApp ou e-mail"
        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 text-sm outline-none focus:border-white/50"
      />
      <textarea
        value={mensagem}
        onChange={e => setMensagem(e.target.value)}
        placeholder="Sua mensagem (opcional)"
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 text-sm outline-none resize-none focus:border-white/50"
      />
      {erro && <p className="text-xs text-red-200">{erro}</p>}
      <button
        type="submit"
        disabled={sending}
        className="bg-white text-[var(--brand)] font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {sending ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  )
}
