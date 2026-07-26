'use client'

import { useState } from 'react'
import { submitSiteLead } from '@/lib/site-leads-actions'

/**
 * Formulário de contato — obrigatório em todos os templates. Se
 * `siteId` vier preenchido (site real: sandbox ou demo instantânea),
 * grava em site_leads de verdade. Nas vitrines estáticas de
 * /modelos/[nicho] (siteId undefined) o formulário mostra o estado
 * de sucesso sem gravar nada — é só preview.
 */
export default function LeadForm({
  siteId,
  accent,
  solidBg,
  heading = 'Fale com a gente',
  subtext = 'Preencha o formulário e retornamos rapidinho.',
}: {
  siteId?: string
  accent: string
  solidBg: string
  heading?: string
  subtext?: string
}) {
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !contato.trim()) {
      setErro('Preenche nome e um jeito de te responder (WhatsApp ou e-mail).')
      return
    }
    setErro(null)
    setSending(true)
    try {
      if (siteId) {
        await submitSiteLead(siteId, { nome, contato, mensagem })
      }
      setSent(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar. Tenta de novo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="px-6 py-16 sm:py-20 max-w-xl mx-auto">
      <div className={`relative rounded-3xl p-8 sm:p-10 overflow-hidden bg-[var(--card-bg)] border border-[var(--border)]`}>
        <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-2xl`} />
        <div className="relative">
          <h2 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-2">{heading}</h2>
          <p className="text-sm text-[var(--muted)] mb-6">{subtext}</p>

          {sent ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-display font-bold text-[var(--ink)] mb-1">Recebido!</p>
              <p className="text-sm text-[var(--muted)]">Retornamos assim que possível.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              />
              <input
                value={contato}
                onChange={e => setContato(e.target.value)}
                placeholder="WhatsApp ou e-mail"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              />
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                placeholder="Sua mensagem (opcional)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] resize-none"
              />
              {erro && <p className="text-xs text-red-500">{erro}</p>}
              <button
                type="submit"
                disabled={sending}
                className={`${solidBg} text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60`}
              >
                {sending ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
