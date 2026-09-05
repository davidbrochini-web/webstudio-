'use client'

import { useActionState, useState } from 'react'
import { upsertDiferencial, deleteDiferencial, type DiferencialFormState } from '@/lib/site-diferenciais-actions'

export interface Diferencial {
  id: string
  icone: string | null
  titulo: string
  texto: string
}

function DiferencialForm({ siteId, editing, revalidatePath, onDone }: {
  siteId: string
  editing: Diferencial | null
  revalidatePath: string
  onDone: () => void
}) {
  const boundAction = upsertDiferencial.bind(null, revalidatePath)
  const [state, formAction, pending] = useActionState<DiferencialFormState, FormData>(boundAction, {})

  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.success) onDone()
  }

  return (
    <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-4">
      <input type="hidden" name="site_id" value={siteId} />
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <div className="flex gap-3">
        <input
          name="icone"
          defaultValue={editing?.icone ?? '✅'}
          className="w-16 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-center text-lg"
          maxLength={4}
        />
        <input
          name="titulo"
          required
          defaultValue={editing?.titulo}
          placeholder="Título do diferencial"
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
        />
      </div>
      <textarea
        name="texto"
        required
        defaultValue={editing?.texto}
        placeholder="Texto curto explicando o diferencial"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
          {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar diferencial'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function DiferenciaisManager({ siteId, diferenciais, readOnly, revalidatePath }: {
  siteId: string
  diferenciais: Diferencial[]
  readOnly: boolean
  revalidatePath: string
}) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Diferencial>('none')
  const [erro, setErro] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteDiferencial(id, revalidatePath)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar diferencial
        </button>
      )}
      {!readOnly && formOpen === 'new' && (
        <DiferencialForm siteId={siteId} editing={null} revalidatePath={revalidatePath} onDone={() => setFormOpen('none')} />
      )}
      {!readOnly && formOpen !== 'none' && formOpen !== 'new' && (
        <DiferencialForm siteId={siteId} editing={formOpen} revalidatePath={revalidatePath} onDone={() => setFormOpen('none')} />
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {diferenciais.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum diferencial cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {diferenciais.map(d => (
            <li key={d.id} className="py-3 flex items-center gap-3">
              <span className="text-xl w-8 text-center flex-shrink-0">{d.icone}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">{d.titulo}</p>
                <p className="text-xs text-[var(--muted)] truncate">{d.texto}</p>
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
