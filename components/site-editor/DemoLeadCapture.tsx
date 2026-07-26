'use client'

import { useState } from 'react'
import { submitDemoLead } from '@/app/app/editor/actions'

export default function DemoLeadCapture({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !contato.trim()) {
      setErro('Preenche nome e um jeito de te chamar (WhatsApp ou e-mail).')
      return
    }
    setSending(true)
    setErro(null)
    try {
      await submitDemoLead(tenantId, nome, contato)
      setSent(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar. Tenta de novo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-5 py-3.5 rounded-full grad-bg text-white text-sm font-semibold shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
      >
        💬 Gostou? Deixe seu contato
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--card-bg)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-3">🎉</p>
                <h3 className="font-display font-bold text-lg text-[var(--ink)] mb-2">Recebido!</h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  A gente entra em contato em breve pra ativar seu site de verdade.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-[var(--brand)]"
                >
                  Continuar testando
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h3 className="font-display font-bold text-lg text-[var(--ink)] mb-1">
                  Deixe seu contato
                </h3>
                <p className="text-sm text-[var(--muted)] mb-2">
                  A gente entra em contato pra ativar esse site de verdade, com seu domínio e tudo.
                </p>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
                />
                <input
                  value={contato}
                  onChange={e => setContato(e.target.value)}
                  placeholder="WhatsApp ou e-mail"
                  className="px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
                />
                {erro && <p className="text-xs text-red-600">{erro}</p>}
                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 rounded-lg grad-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm font-semibold"
                  >
                    Agora não
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
