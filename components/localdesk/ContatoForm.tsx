'use client'

import { useActionState } from 'react'
import { enviarSolicitacaoContato, type ContatoFormState } from '@/app/projetos-especiais/localdesk/actions'

export default function ContatoForm() {
  const [state, formAction, pending] = useActionState<ContatoFormState, FormData>(enviarSolicitacaoContato, {})

  if (state.success) {
    return (
      <div className="bg-[var(--green-dim)] border border-[var(--green)]/30 rounded-2xl p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-bold text-[var(--ink)] mb-1">Recebemos sua mensagem!</p>
        <p className="text-sm text-[var(--muted)]">A gente te chama em breve pra entender o problema.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">Seu nome</label>
        <input
          name="nome"
          required
          className="w-full text-sm border border-[var(--line)] rounded-xl px-3.5 py-2.5 bg-[var(--bg-panel)] focus:outline-none focus:border-[var(--blue)]"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">WhatsApp ou e-mail</label>
        <input
          name="contato"
          required
          className="w-full text-sm border border-[var(--line)] rounded-xl px-3.5 py-2.5 bg-[var(--bg-panel)] focus:outline-none focus:border-[var(--blue)]"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">O que está acontecendo? (opcional)</label>
        <textarea
          name="mensagem"
          rows={4}
          placeholder="Ex: meu notebook não liga mais, PC travando toda hora..."
          className="w-full text-sm border border-[var(--line)] rounded-xl px-3.5 py-2.5 bg-[var(--bg-panel)] resize-none focus:outline-none focus:border-[var(--blue)]"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 text-sm font-bold text-white bg-[var(--blue)] px-5 py-3 rounded-full hover:opacity-90 transition-opacity"
      >
        {pending ? 'Enviando...' : 'Enviar solicitação'}
      </button>
    </form>
  )
}
