'use client'

import { useState, useTransition } from 'react'
import {
  criarBloqueio, deleteBloqueio,
  type BloqueioData,
} from '@/app/app/(hub)/projeto-especial/agenda/actions'

interface Bloqueio {
  id: string
  data: string
  hora_inicio: string | null
  hora_fim: string | null
  motivo: string | null
  created_at: string
}

function formatData(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BloqueiosManager({ siteId, bloqueios }: { siteId: string; bloqueios: Bloqueio[] }) {
  const [adicionando, setAdicionando] = useState(false)
  const [data, setData] = useState('')
  const [diaInteiro, setDiaInteiro] = useState(true)
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('12:00')
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function salvar() {
    setErro('')
    startTransition(async () => {
      try {
        const payload: BloqueioData = {
          data,
          hora_inicio: diaInteiro ? null : horaInicio,
          hora_fim: diaInteiro ? null : horaFim,
          motivo: motivo.trim() || null,
        }
        await criarBloqueio(siteId, payload)
        setAdicionando(false)
        setData('')
        setMotivo('')
        setDiaInteiro(true)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  const futuros = bloqueios.filter(b => b.data >= new Date().toISOString().slice(0, 10))
  const passados = bloqueios.filter(b => b.data < new Date().toISOString().slice(0, 10))

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--muted)]">
          {futuros.length} bloqueio{futuros.length !== 1 ? 's' : ''} ativo{futuros.length !== 1 ? 's' : ''}
          {passados.length > 0 && ` · ${passados.length} passado${passados.length !== 1 ? 's' : ''}`}
        </p>
        {!adicionando && (
          <button type="button" onClick={() => setAdicionando(true)}
            className="text-sm font-semibold text-white bg-[var(--brand)] rounded-lg px-4 py-2">
            + Bloquear data
          </button>
        )}
      </div>

      {adicionando && (
        <div className="flex flex-col gap-3 p-4 bg-[var(--off)] rounded-xl mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)} required
                className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--page-bg)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Motivo (opcional)</label>
              <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: Congresso"
                className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--page-bg)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input type="checkbox" checked={diaInteiro} onChange={e => setDiaInteiro(e.target.checked)}
                className="accent-[var(--brand)]" />
              Dia inteiro
            </label>
            {!diaInteiro && (
              <>
                <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
                  className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--page-bg)] text-[var(--ink)]" />
                <span className="text-[var(--muted)] text-xs">até</span>
                <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)}
                  className="text-xs border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--page-bg)] text-[var(--ink)]" />
              </>
            )}
          </div>

          {erro && <p className="text-xs text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={salvar} disabled={pending}
              className="text-sm font-semibold text-white bg-[var(--brand)] rounded-lg px-4 py-2 disabled:opacity-50">
              {pending ? 'Salvando…' : 'Bloquear'}
            </button>
            <button type="button" onClick={() => { setAdicionando(false); setErro('') }}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink)] px-2 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {bloqueios.length === 0 && !adicionando && (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="font-display font-bold text-[var(--ink)] mb-1">Nenhum bloqueio cadastrado</p>
          <p className="text-[var(--muted)] text-sm">Bloqueie datas em que a clínica não atende (feriados, congressos, férias).</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {bloqueios.map(b => {
          const passado = b.data < new Date().toISOString().slice(0, 10)
          return (
            <div key={b.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
              passado ? 'bg-[var(--off)] border-[var(--border)] opacity-50' : 'bg-[var(--card-bg)] border-[var(--border)]'
            }`}>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--ink)]">
                  {formatData(b.data)}
                  {b.hora_inicio && b.hora_fim && (
                    <span className="font-normal text-[var(--muted)]"> · {b.hora_inicio.slice(0, 5)}–{b.hora_fim.slice(0, 5)}</span>
                  )}
                  {!b.hora_inicio && <span className="font-normal text-[var(--muted)]"> · dia inteiro</span>}
                </p>
                {b.motivo && <p className="text-xs text-[var(--muted)] mt-0.5">{b.motivo}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {confirmId === b.id ? (
                  <>
                    <span className="text-xs text-[var(--muted)]">Remover?</span>
                    <button type="button" disabled={pending}
                      onClick={() => startTransition(async () => { await deleteBloqueio(b.id); setConfirmId(null) })}
                      className="text-xs font-semibold text-red-600">Confirmar</button>
                    <button type="button" onClick={() => setConfirmId(null)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">Cancelar</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmId(b.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700">Remover</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
