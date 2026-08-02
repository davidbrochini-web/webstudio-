'use client'

import { useState, useTransition } from 'react'
import {
  upsertTipoConsulta, toggleTipoConsultaAtivo, deleteTipoConsulta,
  type TipoConsultaData,
} from '@/app/app/(hub)/projeto-especial/agenda/actions'

interface TipoConsulta {
  id: string
  nome: string
  duracao_minutos: number
  ativo: boolean
}

function TipoForm({ siteId, tipo, onDone }: {
  siteId: string
  tipo?: TipoConsulta
  onDone: () => void
}) {
  const [nome, setNome] = useState(tipo?.nome ?? '')
  const [duracao, setDuracao] = useState(tipo?.duracao_minutos ?? 30)
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()

  function salvar() {
    setErro('')
    startTransition(async () => {
      try {
        const data: TipoConsultaData = { nome: nome.trim(), duracao_minutos: duracao, ativo: tipo?.ativo ?? true }
        await upsertTipoConsulta(siteId, tipo?.id ?? null, data)
        onDone()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-[var(--off)] rounded-xl">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Nome</label>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Consulta de avaliação"
          className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--page-bg)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
      </div>
      <div className="w-32">
        <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Duração (min)</label>
        <input type="number" min={5} step={5} value={duracao} onChange={e => setDuracao(parseInt(e.target.value, 10) || 0)}
          className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--page-bg)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]" />
      </div>
      <button type="button" onClick={salvar} disabled={pending}
        className="text-sm font-semibold text-white bg-[var(--brand)] rounded-lg px-4 py-2 disabled:opacity-50">
        {pending ? 'Salvando…' : tipo ? 'Salvar' : 'Adicionar'}
      </button>
      <button type="button" onClick={onDone} className="text-sm text-[var(--muted)] hover:text-[var(--ink)] px-2 py-2">
        Cancelar
      </button>
      {erro && <p className="w-full text-xs text-red-600">{erro}</p>}
    </div>
  )
}

function TipoRow({ siteId, tipo }: { siteId: string; tipo: TipoConsulta }) {
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [pending, startTransition] = useTransition()

  if (editando) {
    return <TipoForm siteId={siteId} tipo={tipo} onDone={() => setEditando(false)} />
  }

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
      tipo.ativo ? 'bg-[var(--card-bg)] border-[var(--border)]' : 'bg-[var(--off)] border-[var(--border)] opacity-60'
    }`}>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-[var(--ink)] truncate">{tipo.nome}</p>
        <p className="text-xs text-[var(--muted)]">{tipo.duracao_minutos} minutos {!tipo.ativo && '· inativo'}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {confirmando ? (
          <>
            <span className="text-xs text-[var(--muted)]">Excluir?</span>
            <button type="button" disabled={pending}
              onClick={() => startTransition(async () => { await deleteTipoConsulta(tipo.id); setConfirmando(false) })}
              className="text-xs font-semibold text-red-600 hover:text-red-700">
              Confirmar
            </button>
            <button type="button" onClick={() => setConfirmando(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)]">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditando(true)}
              className="text-xs font-semibold text-[var(--brand)] hover:underline">
              Editar
            </button>
            <button type="button" disabled={pending}
              onClick={() => startTransition(() => toggleTipoConsultaAtivo(tipo.id, !tipo.ativo))}
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
              {tipo.ativo ? 'Desativar' : 'Ativar'}
            </button>
            <button type="button" onClick={() => setConfirmando(true)}
              className="text-xs font-semibold text-red-600 hover:text-red-700">
              Excluir
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TiposConsultaManager({ siteId, tipos }: { siteId: string; tipos: TipoConsulta[] }) {
  const [adicionando, setAdicionando] = useState(false)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--muted)]">
          {tipos.length} tipo{tipos.length !== 1 ? 's' : ''} de consulta cadastrado{tipos.length !== 1 ? 's' : ''}
        </p>
        {!adicionando && (
          <button type="button" onClick={() => setAdicionando(true)}
            className="text-sm font-semibold text-white bg-[var(--brand)] rounded-lg px-4 py-2">
            + Novo tipo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {adicionando && <TipoForm siteId={siteId} onDone={() => setAdicionando(false)} />}

        {tipos.length === 0 && !adicionando && (
          <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center">
            <p className="text-3xl mb-2">🩺</p>
            <p className="font-display font-bold text-[var(--ink)] mb-1">Nenhum tipo de consulta ainda</p>
            <p className="text-[var(--muted)] text-sm">Cadastre os tipos de consulta que o paciente pode escolher ao agendar.</p>
          </div>
        )}

        {tipos.map(t => <TipoRow key={t.id} siteId={siteId} tipo={t} />)}
      </div>
    </div>
  )
}
