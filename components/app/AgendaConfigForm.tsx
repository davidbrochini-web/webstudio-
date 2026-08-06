'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  updateConfig, upsertHorario, toggleHorarioAtivo, deleteHorario,
  type PEFormState, type HorarioData,
} from '@/app/app/(hub)/projeto-especial/agenda/actions'

interface Config {
  duracao_slot_minutos: number
  intervalo_minutos: number
  antecedencia_minima_horas: number
  janela_maxima_dias: number
  max_pendentes_por_telefone: number
}

interface Horario {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  ativo: boolean
}

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function AddHorarioRow({ siteId, diaSemana, onDone }: { siteId: string; diaSemana: number; onDone: () => void }) {
  const [inicio, setInicio] = useState('08:00')
  const [fim, setFim] = useState('12:00')
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()

  function salvar() {
    setErro('')
    startTransition(async () => {
      try {
        const data: HorarioData = { dia_semana: diaSemana, hora_inicio: inicio, hora_fim: fim, ativo: true }
        await upsertHorario(siteId, null, data)
        onDone()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <input type="time" value={inicio} onChange={e => setInicio(e.target.value)}
        className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--page-bg)] text-[var(--ink)]" />
      <span className="text-[var(--muted)] text-xs">até</span>
      <input type="time" value={fim} onChange={e => setFim(e.target.value)}
        className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--page-bg)] text-[var(--ink)]" />
      <button type="button" onClick={salvar} disabled={pending}
        className="text-xs font-semibold text-white bg-[var(--brand)] rounded-lg px-3 py-1.5 disabled:opacity-50">
        {pending ? 'Salvando…' : 'Adicionar'}
      </button>
      <button type="button" onClick={onDone} className="text-xs text-[var(--muted)] hover:text-[var(--ink)] px-2">
        Cancelar
      </button>
      {erro && <span className="text-xs text-red-600">{erro}</span>}
      {fim <= inicio && (
        <span className="w-full text-[11px] text-[var(--muted)] mt-1">
          Esse horário cruza a meia-noite — vamos dividir automaticamente em dois blocos
          ({inicio}–23:59 nesse dia, e 00:00–{fim} no dia seguinte). Pra trabalhar 24h, use 00:00 até 23:59.
        </span>
      )}
    </div>
  )
}

function HorarioChip({ horario, onChanged }: { horario: Horario; onChanged: () => void }) {
  const [pending, startTransition] = useTransition()

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs border ${
      horario.ativo ? 'bg-[var(--brand)]/10 border-[var(--brand)]/30 text-[var(--ink)]' : 'bg-[var(--off)] border-[var(--border)] text-[var(--muted)] line-through'
    }`}>
      <span className="font-medium">{horario.hora_inicio.slice(0, 5)} – {horario.hora_fim.slice(0, 5)}</span>
      <button type="button" disabled={pending}
        onClick={() => startTransition(async () => { await toggleHorarioAtivo(horario.id, !horario.ativo); onChanged() })}
        className="hover:opacity-70">
        {horario.ativo ? 'desativar' : 'ativar'}
      </button>
      <button type="button" disabled={pending}
        onClick={() => startTransition(async () => { await deleteHorario(horario.id); onChanged() })}
        className="hover:opacity-70 text-red-600">
        ✕
      </button>
    </div>
  )
}

function GradeHorarios({ siteId, horarios }: { siteId: string; horarios: Horario[] }) {
  const [diaAdicionando, setDiaAdicionando] = useState<number | null>(null)
  // revalidatePath já refaz o fetch dos dados no server após cada ação;
  // essa função só fecha o form/estado local de UI.
  const refresh = () => {}

  return (
    <div className="mt-6">
      <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
        Dias e horários de atendimento
      </label>
      <div className="flex flex-col gap-3">
        {DIAS.map((nomeDia, dia) => {
          const doDia = horarios.filter(h => h.dia_semana === dia)
          return (
            <div key={dia} className="p-4 bg-[var(--off)] rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--ink)]">{nomeDia}</p>
                {diaAdicionando !== dia && (
                  <button type="button" onClick={() => setDiaAdicionando(dia)}
                    className="text-xs font-semibold text-[var(--brand)] hover:underline">
                    + horário
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {doDia.length === 0 && diaAdicionando !== dia && (
                  <span className="text-xs text-[var(--muted)]">Fechado</span>
                )}
                {doDia.map(h => <HorarioChip key={h.id} horario={h} onChanged={refresh} />)}
              </div>
              {diaAdicionando === dia && (
                <AddHorarioRow siteId={siteId} diaSemana={dia} onDone={() => { setDiaAdicionando(null); refresh() }} />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[var(--muted)] mt-3">
        Pode adicionar mais de um horário no mesmo dia (ex: manhã e tarde, com intervalo de almoço).
      </p>
    </div>
  )
}

export default function AgendaConfigForm({ siteId, config, horarios }: {
  siteId: string
  config: Config
  horarios: Horario[]
}) {
  const [state, formAction, pending] = useActionState<PEFormState, FormData>(updateConfig, {})

  return (
    <div className="max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="site_id" value={siteId} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Duração do slot (min)
            </label>
            <input type="number" name="duracao_slot_minutos" defaultValue={config.duracao_slot_minutos} min={5} step={5} required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Intervalo entre slots (min)
            </label>
            <input type="number" name="intervalo_minutos" defaultValue={config.intervalo_minutos} min={0} step={5} required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Antecedência mínima (horas)
            </label>
            <input type="number" name="antecedencia_minima_horas" defaultValue={config.antecedencia_minima_horas} min={0} required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Janela máxima (dias)
            </label>
            <input type="number" name="janela_maxima_dias" defaultValue={config.janela_maxima_dias} min={1} required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Máx. de agendamentos pendentes por telefone
            </label>
            <input type="number" name="max_pendentes_por_telefone" defaultValue={config.max_pendentes_por_telefone} min={1} required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-[var(--brand)] bg-[var(--brand)]/10 rounded-xl px-4 py-2.5">Configurações salvas.</p>
        )}

        <button type="submit" disabled={pending}
          className="self-start text-sm font-semibold text-white bg-[var(--brand)] rounded-xl px-6 py-2.5 disabled:opacity-50 transition-opacity">
          {pending ? 'Salvando…' : 'Salvar configurações'}
        </button>
      </form>

      <GradeHorarios siteId={siteId} horarios={horarios} />
    </div>
  )
}
