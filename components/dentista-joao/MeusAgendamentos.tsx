'use client'

import { useActionState, useState } from 'react'
import {
  consultarAgendamentos, cancelarAgendamentoPaciente, solicitarCodigoAcesso,
  type OtpFormState, type CancelState, type SolicitarCodigoState,
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

function SolicitarCodigo({ email, onEnviado }: { email: string; onEnviado: () => void }) {
  const [state, formAction, pending] = useActionState<SolicitarCodigoState, FormData>(solicitarCodigoAcesso, {})

  if (state.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2.5">
        Código enviado! Confira seu e-mail (e a caixa de spam) — vale por 10 minutos.
        <button type="button" onClick={onEnviado} className="block mt-1 text-xs font-semibold underline">
          Já recebi, quero digitar o código
        </button>
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="email" value={email} />
      {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>}
      <button type="submit" disabled={pending || !email}
        className="bg-[var(--dj-primary)] text-white font-semibold rounded-xl px-6 py-3 text-sm disabled:opacity-50 transition-colors">
        {pending ? 'Enviando…' : 'Enviar código por e-mail'}
      </button>
    </form>
  )
}

export default function MeusAgendamentos() {
  const [state, formAction, pending] = useActionState<OtpFormState, FormData>(consultarAgendamentos, {})
  const [email, setEmail] = useState('')
  const [codigoEnviado, setCodigoEnviado] = useState(false)

  return (
    <div className="max-w-lg mx-auto">
      {!state.agendamentos ? (
        <>
          <p className="text-sm text-slate-500 mb-6">
            Informe o e-mail usado no agendamento para receber um código de acesso e consultar seus horários.
          </p>
          <div className="flex flex-col gap-4">
            <input name="email-lookup" type="email" required placeholder="E-mail" value={email}
              onChange={e => { setEmail(e.target.value); setCodigoEnviado(false) }}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />

            {!codigoEnviado ? (
              <SolicitarCodigo email={email} onEnviado={() => setCodigoEnviado(true)} />
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="email" value={email} />
                <input name="codigo" required placeholder="Código recebido por e-mail" maxLength={6}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-center"
                  autoComplete="one-time-code" />
                {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>}
                <button type="submit" disabled={pending}
                  className="bg-[var(--dj-primary)] hover:bg-[var(--dj-primary)] text-white font-semibold rounded-xl px-6 py-3 text-sm disabled:opacity-50 transition-colors">
                  {pending ? 'Consultando…' : 'Consultar agendamentos'}
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        <>
          {state.agendamentos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-display font-bold text-lg text-[var(--dj-secondary)] mb-1">Nenhum agendamento encontrado</p>
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
                        <p className="font-semibold text-sm text-[var(--dj-secondary)]">
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
