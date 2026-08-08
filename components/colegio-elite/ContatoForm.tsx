'use client'

import { useActionState } from 'react'
import { enviarSolicitacaoContato, type ContatoFormState } from '@/app/projetos-especiais/colegio-elite/actions'

export default function ContatoForm() {
  const [state, formAction, pending] = useActionState<ContatoFormState, FormData>(enviarSolicitacaoContato, {})

  if (state.success) {
    return (
      <div className="text-center py-10">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-display font-bold text-lg text-[var(--ce-secondary)] mb-1">Mensagem enviada!</p>
        <p className="text-sm text-slate-500">Nossa equipe vai entrar em contato em breve.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="nome" required placeholder="Nome" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
        <input name="sobrenome" required placeholder="Sobrenome" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="email" type="email" placeholder="E-mail" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
        <input name="telefone" placeholder="Telefone/WhatsApp" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <textarea name="mensagem" placeholder="Sua mensagem (opcional)" rows={4} className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--ce-primary)] text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 self-start"
      >
        {pending ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  )
}
