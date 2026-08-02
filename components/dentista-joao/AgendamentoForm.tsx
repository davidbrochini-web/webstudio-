'use client'

import { useActionState, useState } from 'react'
import { criarAgendamentoPublico, type AgendamentoFormState } from '@/app/projetos-especiais/dentista-joao/actions'

interface Config {
  duracao_slot_minutos: number
  intervalo_minutos: number
  antecedencia_minima_horas: number
  janela_maxima_dias: number
}

interface Horario {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
}

interface Bloqueio {
  data: string
  hora_inicio: string | null
  hora_fim: string | null
}

interface Ocupado {
  data: string
  hora_inicio: string
  hora_fim: string
}

interface TipoConsulta {
  id: string
  nome: string
  duracao_minutos: number
}

function timeToMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function minToTime(m: number) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` }
function fmtDate(d: Date) { return d.toISOString().slice(0, 10) }

function calcSlots(
  dateStr: string,
  config: Config,
  horarios: Horario[],
  bloqueios: Bloqueio[],
  ocupados: Ocupado[],
) {
  const d = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay()
  const daySchedules = horarios.filter(h => h.dia_semana === dow)
  if (daySchedules.length === 0) return []

  // Day-level block
  if (bloqueios.some(b => b.data === dateStr && !b.hora_inicio)) return []

  const slotDur = config.duracao_slot_minutos
  const step = slotDur + config.intervalo_minutos
  const slots: { hora_inicio: string; hora_fim: string }[] = []

  for (const sch of daySchedules) {
    const start = timeToMin(sch.hora_inicio)
    const end = timeToMin(sch.hora_fim)
    for (let m = start; m + slotDur <= end; m += step) {
      const slotStart = minToTime(m)
      const slotEnd = minToTime(m + slotDur)

      // Partial block
      const blocked = bloqueios.some(b => {
        if (b.data !== dateStr || !b.hora_inicio || !b.hora_fim) return false
        return m >= timeToMin(b.hora_inicio) && m < timeToMin(b.hora_fim)
      })
      if (blocked) continue

      // Occupied
      const taken = ocupados.some(o => o.data === dateStr && o.hora_inicio.slice(0, 5) === slotStart)
      if (taken) continue

      slots.push({ hora_inicio: slotStart, hora_fim: slotEnd })
    }
  }

  // Min advance filter
  const now = new Date()
  const minAdvanceMs = config.antecedencia_minima_horas * 60 * 60 * 1000
  return slots.filter(s => {
    const slotDate = new Date(`${dateStr}T${s.hora_inicio}:00`)
    return slotDate.getTime() - now.getTime() >= minAdvanceMs
  })
}

function getDaysWithSlots(config: Config, horarios: Horario[], bloqueios: Bloqueio[], ocupados: Ocupado[]) {
  const days: string[] = []
  const now = new Date()
  const maxDate = new Date()
  maxDate.setDate(now.getDate() + config.janela_maxima_dias)

  for (let d = new Date(now); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const ds = fmtDate(d)
    const slots = calcSlots(ds, config, horarios, bloqueios, ocupados)
    if (slots.length > 0) days.push(ds)
  }
  return days
}

export default function AgendamentoForm({ config, horarios, bloqueios, ocupados, tiposConsulta }: {
  config: Config
  horarios: Horario[]
  bloqueios: Bloqueio[]
  ocupados: Ocupado[]
  tiposConsulta: TipoConsulta[]
}) {
  const [state, formAction, pending] = useActionState<AgendamentoFormState, FormData>(criarAgendamentoPublico, {})
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{ hora_inicio: string; hora_fim: string } | null>(null)

  const availableDays = getDaysWithSlots(config, horarios, bloqueios, ocupados)
  const daySlots = selectedDate ? calcSlots(selectedDate, config, horarios, bloqueios, ocupados) : []

  // Reset slot when date changes — driven by onChange, not useEffect
  // (same fix as BlogEditor's slug: avoids cascading render from setState-in-effect)
  function onDateChange(day: string) {
    setSelectedDate(day)
    setSelectedSlot(null)
  }

  if (state.success) {
    return (
      <div className="text-center py-10">
        <p className="text-3xl mb-3">✅</p>
        <p className="font-display font-bold text-lg text-[#0B2B3C] mb-1">Agendamento solicitado!</p>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Você receberá uma confirmação assim que a clínica aprovar seu horário.
          Caso precise consultar ou cancelar, acesse &quot;Meus Agendamentos&quot;.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      <input type="hidden" name="data" value={selectedDate} />
      <input type="hidden" name="hora_inicio" value={selectedSlot?.hora_inicio ?? ''} />
      <input type="hidden" name="hora_fim" value={selectedSlot?.hora_fim ?? ''} />

      {/* Tipo de consulta */}
      {tiposConsulta.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tipo de consulta
          </label>
          <select name="tipo_consulta_id"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="">Selecione...</option>
            {tiposConsulta.map(t => (
              <option key={t.id} value={t.id}>{t.nome} ({t.duracao_minutos} min)</option>
            ))}
          </select>
        </div>
      )}

      {/* Calendário de dias */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Escolha o dia
        </label>
        {availableDays.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">Nenhum horário disponível no momento.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableDays.slice(0, 21).map(day => {
              const d = new Date(day + 'T00:00:00')
              const active = selectedDate === day
              return (
                <button key={day} type="button" onClick={() => onDateChange(day)}
                  className={`flex flex-col items-center rounded-xl px-3 py-2 border text-xs transition-all ${
                    active
                      ? 'bg-[#0d7377] text-white border-[#0d7377]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#0EA5A0]'
                  }`}>
                  <span className="font-semibold">{d.getDate()}</span>
                  <span className="text-[10px] uppercase">{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Slots do dia */}
      {selectedDate && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Horário — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </label>
          {daySlots.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">Nenhum horário disponível neste dia.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {daySlots.map(s => {
                const active = selectedSlot?.hora_inicio === s.hora_inicio
                return (
                  <button key={s.hora_inicio} type="button" onClick={() => setSelectedSlot(s)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium border transition-all ${
                      active
                        ? 'bg-[#0d7377] text-white border-[#0d7377]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#0EA5A0]'
                    }`}>
                    {s.hora_inicio}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Dados do paciente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="nome" required placeholder="Nome completo" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
        <input name="telefone" required placeholder="Telefone/WhatsApp" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      </div>
      <input name="email" type="email" required placeholder="E-mail" className="px-4 py-3 rounded-xl border border-slate-200 text-sm" />
      <textarea name="mensagem" placeholder="Observações (opcional)" rows={3}
        className="px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none" />

      {state.error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>}

      <button type="submit" disabled={pending || !selectedSlot}
        className="bg-[#0d7377] hover:bg-[#0b6163] text-white font-semibold rounded-xl px-6 py-3 text-sm disabled:opacity-50 transition-colors">
        {pending ? 'Enviando…' : 'Solicitar agendamento'}
      </button>
    </form>
  )
}
