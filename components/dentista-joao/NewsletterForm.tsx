'use client'

import { useActionState } from 'react'
import { inscreverNewsletter, type ContatoFormState } from '@/app/projetos-especiais/dentista-joao/actions'

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<ContatoFormState, FormData>(inscreverNewsletter, {})

  if (state.success) {
    return <p className="text-sm text-white/70">Inscrição recebida, obrigado!</p>
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input name="nome" placeholder="Nome" className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40" />
      <input name="email" type="email" placeholder="E-mail" className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40" />
      {state.error && <p className="text-xs text-red-300">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[#0EA5A0] text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Enviando...' : 'Inscrever-se'}
      </button>
    </form>
  )
}
