'use client'

import { useActionState, useState } from 'react'

export interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'date' | 'checkbox'
  required?: boolean
  colSpan?: 1 | 2
}

export interface PEFormState {
  error?: string
  success?: boolean
}

interface Item {
  id: string
  [key: string]: unknown
}

export default function ConteudoManager({
  siteId,
  itens,
  fields,
  columns,
  upsertAction,
  deleteAction,
  addLabel,
  emptyLabel,
  readOnly,
}: {
  siteId: string
  itens: Item[]
  fields: FieldConfig[]
  columns: { key: string; label: string }[]
  upsertAction: (prev: PEFormState, fd: FormData) => Promise<PEFormState>
  deleteAction: (id: string) => Promise<void>
  addLabel: string
  emptyLabel: string
  readOnly: boolean
}) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Item>('none')
  const [erro, setErro] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<PEFormState, FormData>(upsertAction, {})

  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.success) setFormOpen('none')
  }

  const editing = formOpen !== 'none' && formOpen !== 'new' ? formOpen : null

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteAction(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div>
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + {addLabel}
        </button>
      )}

      {!readOnly && formOpen !== 'none' && (
        <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 grid grid-cols-2 gap-3 mb-6 max-w-2xl">
          <input type="hidden" name="site_id" value={siteId} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          {fields.map(f => (
            <div key={f.name} className={f.colSpan === 2 || !f.colSpan ? 'col-span-2' : 'col-span-1'}>
              {f.type === 'textarea' ? (
                <textarea
                  name={f.name}
                  required={f.required}
                  defaultValue={(editing?.[f.name] as string) ?? ''}
                  placeholder={f.label}
                  rows={f.name === 'conteudo' || f.name === 'descricao_completa' ? 6 : 3}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm resize-none"
                />
              ) : f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
                  <input type="checkbox" name={f.name} defaultChecked={editing ? Boolean(editing[f.name]) : true} className="w-4 h-4" />
                  {f.label}
                </label>
              ) : (
                <input
                  name={f.name}
                  type={f.type === 'date' ? 'date' : 'text'}
                  required={f.required}
                  defaultValue={(editing?.[f.name] as string) ?? ''}
                  placeholder={f.label}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm"
                />
              )}
            </div>
          ))}

          {state.error && <p className="col-span-2 text-xs text-red-600">{state.error}</p>}

          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
              {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar'}
            </button>
            <button type="button" onClick={() => setFormOpen('none')} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {itens.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                {columns.map(c => <th key={c.key} className="px-4 py-2.5 font-medium text-[var(--muted)]">{c.label}</th>)}
                {!readOnly && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {itens.map(item => (
                <tr key={item.id}>
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-2.5 text-[var(--ink)]">
                      {c.key === 'publicado' ? (item[c.key] ? '✅' : '—') : String(item[c.key] ?? '—')}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => setFormOpen(item)} className="text-xs font-semibold text-[var(--brand)] mr-3">Editar</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
