'use client'

import { useActionState, useState } from 'react'
import { upsertDepoimento, deleteDepoimento, type DepoimentoFormState } from '@/app/app/site/depoimentos/actions'

export interface Depoimento {
  id: string
  nome: string
  texto: string
}

function DepoimentoForm({ siteId, editing, onDone }: { siteId: string; editing: Depoimento | null; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<DepoimentoFormState, FormData>(upsertDepoimento, {})

  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.success) onDone()
  }

  return (
    <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-4">
      <input type="hidden" name="site_id" value={siteId} />
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <input
        name="nome"
        required
        defaultValue={editing?.nome}
        placeholder="Nome do cliente"
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />
      <textarea
        name="texto"
        required
        defaultValue={editing?.texto}
        placeholder="O que o cliente disse"
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
          {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar depoimento'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function DepoimentosManager({ siteId, depoimentos, readOnly }: { siteId: string; depoimentos: Depoimento[]; readOnly: boolean }) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Depoimento>('none')
  const [erro, setErro] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteDepoimento(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar depoimento
        </button>
      )}
      {!readOnly && formOpen === 'new' && <DepoimentoForm siteId={siteId} editing={null} onDone={() => setFormOpen('none')} />}
      {!readOnly && formOpen !== 'none' && formOpen !== 'new' && <DepoimentoForm siteId={siteId} editing={formOpen} onDone={() => setFormOpen('none')} />}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {depoimentos.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum depoimento cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {depoimentos.map(d => (
            <li key={d.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">{d.nome}</p>
                <p className="text-xs text-[var(--muted)]">{d.texto}</p>
              </div>
              {!readOnly && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setFormOpen(d)} className="text-xs font-semibold text-[var(--brand)]">Editar</button>
                  <button onClick={() => handleDelete(d.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
