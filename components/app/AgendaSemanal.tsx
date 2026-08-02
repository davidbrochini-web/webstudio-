'use client'

import { useState, useTransition } from 'react'
import { mudarStatusAgendamento, type StatusAgendamento } from '@/app/app/(hub)/projeto-especial/agenda/actions'

interface Config {
  duracao_slot_minutos: number
  intervalo_minutos: number
}

interface Horario {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  ativo: boolean
}

interface Bloqueio {
  data: string
  hora_inicio: string | null
  hora_fim: string | null
  motivo: string | null
}

interface Agendamento {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  paciente_nome: string
  paciente_telefone: string
  paciente_email: string
  status: string
  tipo_consulta: { nome: string } | null
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const STATUS_CORES: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmado: 'bg-blue-100 text-blue-800 border-blue-300',
  realizado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-gray-100 text-gray-500 border-gray-300 line-through',
  falta: 'bg-red-100 text-red-800 border-red-300',
}
const STATUS_ACOES: { label: string; status: StatusAgendamento }[] = [
  { label: 'Confirmar', status: 'confirmado' },
  { label: 'Realizado', status: 'realizado' },
  { label: 'Cancelar', status: 'cancelado' },
  { label: 'Falta', status: 'falta' },
]

function getWeekDates(offset: number): Date[] {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + offset * 7 + 1) // segunda
  const dates: Date[] = []
  for (let i = 0; i < 6; i++) { // seg-sab
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    dates.push(d)
  }
  return dates
}

function fmtDate(d: Date) { return d.toISOString().slice(0, 10) }

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function AgendamentoCard({ ag }: { ag: Agendamento }) {
  const [pending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-lg border p-2 text-[11px] leading-tight cursor-pointer ${STATUS_CORES[ag.status] ?? ''}`}
      onClick={() => setExpanded(!expanded)}>
      <p className="font-semibold truncate">{ag.paciente_nome}</p>
      <p className="opacity-70">{ag.hora_inicio.slice(0, 5)}–{ag.hora_fim.slice(0, 5)}</p>
      {ag.tipo_consulta && <p className="opacity-70">{ag.tipo_consulta.nome}</p>}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-current/20 space-y-1" onClick={e => e.stopPropagation()}>
          <p>📞 {ag.paciente_telefone}</p>
          <p>✉ {ag.paciente_email}</p>
          <p className="font-semibold capitalize">Status: {ag.status}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {STATUS_ACOES.filter(a => a.status !== ag.status).map(a => (
              <button key={a.status} disabled={pending}
                onClick={() => startTransition(() => mudarStatusAgendamento(ag.id, a.status))}
                className="text-[10px] font-semibold bg-white/60 hover:bg-white rounded px-1.5 py-0.5 disabled:opacity-50">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgendaSemanal({ config, horarios, bloqueios, agendamentos }: {
  config: Config
  horarios: Horario[]
  bloqueios: Bloqueio[]
  agendamentos: Agendamento[]
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const weekDates = getWeekDates(weekOffset)
  const weekLabel = `${weekDates[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekDates[5].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  // find earliest/latest hours across all active schedules
  const activeH = horarios.filter(h => h.ativo)
  if (activeH.length === 0) {
    return (
      <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
        <p className="text-3xl mb-2">📭</p>
        <p className="font-display font-bold text-[var(--ink)] mb-1">Nenhum horário de atendimento configurado</p>
        <p className="text-[var(--muted)] text-sm">Configure os horários na aba Configurações primeiro.</p>
      </div>
    )
  }

  const minH = Math.min(...activeH.map(h => timeToMin(h.hora_inicio)))
  const maxH = Math.max(...activeH.map(h => timeToMin(h.hora_fim)))
  const slotDur = config.duracao_slot_minutos
  const interval = config.intervalo_minutos
  const step = slotDur + interval

  const timeSlots: string[] = []
  for (let m = minH; m + slotDur <= maxH; m += step) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    timeSlots.push(`${hh}:${mm}`)
  }

  function isDayBlocked(dateStr: string) {
    return bloqueios.some(b => b.data === dateStr && !b.hora_inicio)
  }

  function isSlotBlocked(dateStr: string, slotStart: string) {
    const sm = timeToMin(slotStart)
    return bloqueios.some(b => {
      if (b.data !== dateStr) return false
      if (!b.hora_inicio || !b.hora_fim) return false
      return sm >= timeToMin(b.hora_inicio) && sm < timeToMin(b.hora_fim)
    })
  }

  function hasSchedule(dow: number, slotStart: string) {
    const sm = timeToMin(slotStart)
    return activeH.some(h => h.dia_semana === dow && sm >= timeToMin(h.hora_inicio) && sm + slotDur <= timeToMin(h.hora_fim))
  }

  function getAgendamento(dateStr: string, slotStart: string) {
    return agendamentos.find(a => a.data === dateStr && a.hora_inicio.slice(0, 5) === slotStart && a.status !== 'cancelado')
  }

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div>
      {/* Nav de semana */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="text-sm font-semibold text-[var(--brand)] hover:underline">← Anterior</button>
        <p className="text-sm font-semibold text-[var(--ink)]">{weekLabel}</p>
        <button onClick={() => setWeekOffset(w => w + 1)} className="text-sm font-semibold text-[var(--brand)] hover:underline">Próxima →</button>
      </div>

      {/* Grid semanal */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_repeat(6,1fr)] gap-px bg-[var(--border)] rounded-t-xl overflow-hidden">
            <div className="bg-[var(--off)] p-2" />
            {weekDates.map(d => {
              const ds = fmtDate(d)
              const isHoje = ds === hoje
              const dow = d.getDay()
              return (
                <div key={ds} className={`p-2 text-center text-xs font-semibold ${isHoje ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : 'bg-[var(--off)] text-[var(--ink)]'}`}>
                  {DIAS_SEMANA[dow]} {d.getDate()}
                </div>
              )
            })}
          </div>

          {/* Body */}
          {timeSlots.map(slot => (
            <div key={slot} className="grid grid-cols-[60px_repeat(6,1fr)] gap-px bg-[var(--border)]">
              <div className="bg-[var(--page-bg)] p-1 text-[10px] text-[var(--muted)] text-right pr-2 font-mono">
                {slot}
              </div>
              {weekDates.map(d => {
                const ds = fmtDate(d)
                const dow = d.getDay()
                const dayBlocked = isDayBlocked(ds)
                const slotBlocked = isSlotBlocked(ds, slot)
                const inSchedule = hasSchedule(dow, slot)
                const ag = getAgendamento(ds, slot)

                let cellClass = 'bg-[var(--page-bg)]'
                let content = null

                if (!inSchedule) {
                  cellClass = 'bg-[var(--off)]'
                } else if (dayBlocked || slotBlocked) {
                  cellClass = 'bg-red-50'
                  content = <span className="text-[9px] text-red-400">bloqueado</span>
                } else if (ag) {
                  content = <AgendamentoCard ag={ag} />
                }

                return (
                  <div key={ds} className={`${cellClass} p-0.5 min-h-[48px]`}>
                    {content}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
