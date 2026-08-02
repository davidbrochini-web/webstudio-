'use client'

import { useState, useTransition, useMemo } from 'react'
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

const DIAS_SEMANA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DIAS_SEMANA_LONGO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const STATUS_INFO: Record<string, { label: string; cor: string; bola: string }> = {
  pendente:   { label: 'Pendente',   cor: 'bg-amber-100 text-amber-800 border-amber-300', bola: 'bg-amber-500' },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-800 border-blue-300',   bola: 'bg-blue-500' },
  realizado:  { label: 'Realizado',  cor: 'bg-green-100 text-green-800 border-green-300', bola: 'bg-green-500' },
  cancelado:  { label: 'Cancelado',  cor: 'bg-gray-100 text-gray-500 border-gray-300',    bola: 'bg-gray-400' },
  falta:      { label: 'Falta',      cor: 'bg-red-100 text-red-800 border-red-300',       bola: 'bg-red-500' },
}
const STATUS_ACOES: { label: string; icon: string; status: StatusAgendamento }[] = [
  { label: 'Confirmar',  icon: '✓', status: 'confirmado' },
  { label: 'Realizado',  icon: '✔️', status: 'realizado' },
  { label: 'Cancelar',   icon: '✕', status: 'cancelado' },
  { label: 'Falta',      icon: '⚠️', status: 'falta' },
]

function fmtDate(d: Date) { return d.toISOString().slice(0, 10) }
function hoje() { return fmtDate(new Date()) }

// Gera os próximos N dias a partir de hoje (inclusive) — estilo agenda de
// celular, não semana fixa seg-sáb. Fica mais fácil dele entender "os
// próximos dias" do que ficar navegando semana a semana.
function gerarDias(qtd: number): Date[] {
  const out: Date[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < qtd; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(d)
  }
  return out
}

function AgendamentoCard({ ag }: { ag: Agendamento }) {
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()
  const info = STATUS_INFO[ag.status] ?? STATUS_INFO.pendente

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${info.cor}`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-shrink-0 text-center bg-white/70 rounded-xl px-3 py-2 min-w-[64px]">
          <p className="font-display font-extrabold text-base leading-none">{ag.hora_inicio.slice(0, 5)}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[15px] truncate">{ag.paciente_nome}</p>
          <p className="text-xs opacity-80 truncate">{ag.tipo_consulta?.nome ?? 'Consulta'}</p>
        </div>
        <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-white/70 flex-shrink-0">
          {info.label}
        </span>
        <span className="text-lg flex-shrink-0 opacity-50">{expanded ? '︿' : '﹀'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-current/15">
          <div className="flex flex-col gap-1 mb-3 text-sm">
            <a href={`tel:${ag.paciente_telefone}`} className="hover:underline">📞 {ag.paciente_telefone}</a>
            <a href={`mailto:${ag.paciente_email}`} className="hover:underline truncate">✉️ {ag.paciente_email}</a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_ACOES.filter(a => a.status !== ag.status).map(a => (
              <button
                key={a.status}
                disabled={pending}
                onClick={() => startTransition(() => mudarStatusAgendamento(ag.id, a.status))}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold bg-white/80 hover:bg-white rounded-xl py-2.5 disabled:opacity-50 transition-colors"
              >
                <span>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgendaSemanal({ horarios, bloqueios, agendamentos }: {
  config: Config
  horarios: Horario[]
  bloqueios: Bloqueio[]
  agendamentos: Agendamento[]
}) {
  const dias = useMemo(() => gerarDias(30), [])
  const [selecionado, setSelecionado] = useState(hoje())

  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>()
    for (const ag of agendamentos) {
      if (!map.has(ag.data)) map.set(ag.data, [])
      map.get(ag.data)!.push(ag)
    }
    for (const list of map.values()) list.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
    return map
  }, [agendamentos])

  const diaSelecionadoObj = new Date(selecionado + 'T00:00:00')
  const dowSelecionado = diaSelecionadoObj.getDay()
  const agsDoDia = agendamentosPorDia.get(selecionado) ?? []

  const bloqueioDiaInteiro = bloqueios.find(b => b.data === selecionado && !b.hora_inicio)
  const bloqueiosParciais = bloqueios.filter(b => b.data === selecionado && b.hora_inicio)
  const temExpediente = horarios.some(h => h.dia_semana === dowSelecionado && h.ativo)

  return (
    <div>
      {/* Tira de dias — rolagem horizontal, estilo agenda de celular */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1 snap-x snap-mandatory">
        {dias.map(d => {
          const ds = fmtDate(d)
          const isHoje = ds === hoje()
          const isSelecionado = ds === selecionado
          const ags = agendamentosPorDia.get(ds) ?? []
          const temPendente = ags.some(a => a.status === 'pendente')
          return (
            <button
              key={ds}
              onClick={() => setSelecionado(ds)}
              className={`snap-start flex-shrink-0 flex flex-col items-center gap-0.5 rounded-2xl px-3.5 py-2.5 min-w-[58px] border-2 transition-all ${
                isSelecionado
                  ? 'bg-[var(--brand)] border-[var(--brand)] text-white shadow-md'
                  : isHoje
                    ? 'bg-[var(--brand)]/10 border-[var(--brand)]/40 text-[var(--ink)]'
                    : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--ink)] hover:border-[var(--brand)]/40'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelecionado ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                {DIAS_SEMANA_ABREV[d.getDay()]}
              </span>
              <span className="font-display font-extrabold text-lg leading-none">{d.getDate()}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                ags.length === 0 ? 'bg-transparent' : temPendente ? 'bg-amber-400' : isSelecionado ? 'bg-white' : 'bg-[var(--brand)]'
              }`} />
            </button>
          )
        })}
      </div>

      {/* Cabeçalho do dia selecionado */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-lg text-[var(--ink)]">
            {DIAS_SEMANA_LONGO[dowSelecionado]}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {diaSelecionadoObj.getDate()} de {MESES_ABREV[diaSelecionadoObj.getMonth()]} de {diaSelecionadoObj.getFullYear()}
          </p>
        </div>
        {agsDoDia.length > 0 && (
          <span className="text-sm font-bold text-[var(--brand)] bg-[var(--brand)]/10 rounded-full px-3 py-1.5 flex-shrink-0">
            {agsDoDia.length} agendamento{agsDoDia.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Avisos de bloqueio / dia fechado */}
      {bloqueioDiaInteiro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
          🚫 Dia bloqueado{bloqueioDiaInteiro.motivo ? ` — ${bloqueioDiaInteiro.motivo}` : ''}
        </div>
      )}
      {!bloqueioDiaInteiro && bloqueiosParciais.map((b, i) => (
        <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
          🚫 Bloqueado das {b.hora_inicio?.slice(0, 5)} às {b.hora_fim?.slice(0, 5)}{b.motivo ? ` — ${b.motivo}` : ''}
        </div>
      ))}
      {!temExpediente && agsDoDia.length === 0 && !bloqueioDiaInteiro && (
        <div className="flex items-center gap-2 bg-[var(--off)] text-[var(--muted)] rounded-xl px-4 py-3 mb-4 text-sm font-medium">
          🌙 Sem atendimento configurado pra esse dia
        </div>
      )}

      {/* Lista de agendamentos do dia */}
      {agsDoDia.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-[var(--muted)] text-sm font-medium">Nenhum agendamento nesse dia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {agsDoDia.map(ag => <AgendamentoCard key={ag.id} ag={ag} />)}
        </div>
      )}
    </div>
  )
}
