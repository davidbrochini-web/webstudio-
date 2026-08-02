'use client'

import { useActionState, useState } from 'react'
import {
  consultarAgendamentos, cancelarAgendamentoPaciente,
  type OtpFormState, type CancelState,
} from '@/app/projetos-especiais/dentista-joao/actions'

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  pendente: { label: 'Pendente', cor: 'bg-amber-100 text-amber-800' },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-800' },
  realizado: { label: 'Realizado', cor: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', cor: 'bg-gray-100 text-gray-500' },
  falta: { label: 'Falta', cor: 'bg-red-100 text-red-800' },
}

function CancelButton({ id, email }: { id: string; email: string }) {
  const [state, formAction, pending] = useActionState<CancelState, FormData>(cancelarAgendamentoPaciente, {})
  const [confirming, setConfirming] = useState(false)

  if (state.success) return <span className="text-xs text-green-600 font-semibold">Cancelado</span>

  if (confirming) {
    return (
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="email" value={email} />
        <span className="text-xs text-slate-400">Tem certeza?</span>
        <button type="submit" disabled={pending} className="text-xs font-semibold text-red-600 disabled:opacity-50">
          {pending ? '...' : 'Confirmar'}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-xs text-slate-400">Não</button>
        {state.error && <span className="text-xs text-red-600">{state.error}</span>}
      </form>
    )
  }

  return (
    <button type="button" onClick={() => setConfirming(true)}
      className="text-xs font-semibold text-red-600 hover:text-red-700">
      Cancelar
    </button>
  )
}

export default function MeusAgendamentos() {
  const [state, formAction, pending] = useActionState<OtpFormState, FormData>(consultarAgendamentos, {})
  const [email, setEmail] = useState('')

  return (
    <div className="max-w-lg mx-auto">
      {!state.agendamentos ? (
        <>
          <p className="text-sm text-slate-500 mb-6">
            Informe o e-mail usado no agendamento e o código de verificação para consultar seus horários.
          </p>
          <form action={formAction} className="flex flex-col gap-4">
            <input name="email" type="email" required placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
            <input name="codigo" required placeholder="Código de verificação" maxLength={6}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-center"
              autoComplete="one-time-code" />
            <p className="text-xs text-slate-400">
              Na fase atual, use o código <strong>000000</strong> para acessar.
            </p>
            {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>}
            <button type="submit" disabled={pending}
              className="bg-[#0d7377] hover:bg-[#0b6163] text-white font-semibold rounded-xl px-6 py-3 text-sm disabled:opacity-50 transition-colors">
              {pending ? 'Consultando…' : 'Consultar agendamentos'}
            </button>
          </form>
        </>
      ) : (
        <>
          {state.agendamentos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-display font-bold text-lg text-[#0B2B3C] mb-1">Nenhum agendamento encontrado</p>
              <p className="text-sm text-slate-500">Não encontramos agendamentos para esse e-mail.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {state.agendamentos.map(ag => {
                const s = STATUS_LABELS[ag.status] ?? { label: ag.status, cor: '' }
                const futuro = ag.data >= new Date().toISOString().slice(0, 10) && !['cancelado', 'realizado', 'falta'].includes(ag.status)
                return (
                  <div key={ag.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-[#0B2B3C]">
                          {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          {' · '}{ag.hora_inicio.slice(0, 5)}–{ag.hora_fim.slice(0, 5)}
                        </p>
                        {ag.tipo_consulta && <p className="text-xs text-slate-500 mt-0.5">{ag.tipo_consulta.nome}</p>}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.cor}`}>{s.label}</span>
                    </div>
                    {futuro && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <CancelButton id={ag.id} email={email} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
