'use client'

import { useActionState, useState } from 'react'
import { upsertFaq, deleteFaq, type FaqFormState } from '@/lib/site-faq-actions'

export interface Faq {
  id: string
  pergunta: string
  resposta: string
  categoria: string | null
}

function FaqForm({ siteId, editing, revalidatePath, onDone }: {
  siteId: string
  editing: Faq | null
  revalidatePath: string
  onDone: () => void
}) {
  const boundAction = upsertFaq.bind(null, revalidatePath)
  const [state, formAction, pending] = useActionState<FaqFormState, FormData>(boundAction, {})

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
        name="pergunta"
        required
        defaultValue={editing?.pergunta}
        placeholder="Pergunta"
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />
      <textarea
        name="resposta"
        required
        defaultValue={editing?.resposta}
        placeholder="Resposta"
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />
      <input
        name="categoria"
        defaultValue={editing?.categoria ?? ''}
        placeholder="Categoria (opcional)"
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
          {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar pergunta'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function FaqManager({ siteId, faqs, readOnly, revalidatePath }: {
  siteId: string
  faqs: Faq[]
  readOnly: boolean
  revalidatePath: string
}) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Faq>('none')
  const [erro, setErro] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteFaq(id, revalidatePath)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar pergunta
        </button>
      )}
      {!readOnly && formOpen === 'new' && (
        <FaqForm siteId={siteId} editing={null} revalidatePath={revalidatePath} onDone={() => setFormOpen('none')} />
      )}
      {!readOnly && formOpen !== 'none' && formOpen !== 'new' && (
        <FaqForm siteId={siteId} editing={formOpen} revalidatePath={revalidatePath} onDone={() => setFormOpen('none')} />
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {faqs.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma pergunta cadastrada ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {faqs.map(f => (
            <li key={f.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">{f.pergunta}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{f.resposta}</p>
                {f.categoria && <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-wide">{f.categoria}</p>}
              </div>
              {!readOnly && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setFormOpen(f)} className="text-xs font-semibold text-[var(--brand)]">Editar</button>
                  <button onClick={() => handleDelete(f.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
