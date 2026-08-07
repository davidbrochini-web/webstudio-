'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createLeadPotencial, type LeadFormState } from '@/app/admin/crm/actions'

export default function NovoLeadPotencialForm() {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(createLeadPotencial, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
      <p className="font-display font-bold text-[var(--ink)] mb-4">Cadastrar empresa pra contatar</p>
      <form ref={formRef} action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="nome"
          placeholder="Nome da empresa *"
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <input
          name="contato"
          placeholder="Telefone, WhatsApp ou e-mail"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <input
          name="segmento"
          placeholder="Segmento (ex: dentista, advocacia)"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <input
          name="notas"
          placeholder="Observação inicial (opcional)"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        {state.error && <p className="sm:col-span-2 text-xs text-red-500">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="sm:col-span-2 bg-[var(--dark)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? 'Salvando...' : '+ Adicionar lead potencial'}
        </button>
      </form>
    </div>
  )
}
