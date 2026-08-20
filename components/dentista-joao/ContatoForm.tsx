'use client'

import { useActionState } from 'react'
import { enviarSolicitacaoConsulta, type ContatoFormState } from '@/app/projetos-especiais/dentista-joao/actions'

export default function ContatoForm() {
  const [state, formAction, pending] = useActionState<ContatoFormState, FormData>(enviarSolicitacaoConsulta, {})

  if (state.success) {
    return (
      <div className="text-center py-10">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-display font-bold text-lg text-[var(--dj-secondary)] mb-1">Solicitação enviada!</p>
        <p className="text-sm text-slate-500">Entraremos em contato pra confirmar o melhor horário.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="data_desejada" type="date" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
        <select name="periodo" defaultValue="" className="px-4 py-3 rounded-xl border border-slate-200 text-sm">
          <option value="">Período (opcional)</option>
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
          <option value="noite">Noite</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--dj-primary)] text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 self-start"
      >
        {pending ? 'Enviando...' : 'Solicitar consulta'}
      </button>
    </form>
  )
}
