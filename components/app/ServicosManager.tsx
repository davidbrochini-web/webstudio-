'use client'

import { useActionState, useState } from 'react'
import { upsertServico, deleteServico, type ServicoFormState } from '@/app/app/(hub)/site/servicos/actions'

export interface Servico {
  id: string
  icon: string
  title: string
  description: string
}

function ServicoForm({ siteId, editing, onDone }: { siteId: string; editing: Servico | null; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<ServicoFormState, FormData>(upsertServico, {})

  // Padrão "ajustar state durante o render" (em vez de useEffect) pra
  // fechar o formulário quando a action retornar sucesso — evita o
  // re-render extra que um useEffect causaria aqui.
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
          name="icon"
          defaultValue={editing?.icon ?? '✨'}
          className="w-16 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-center text-lg"
          maxLength={4}
        />
        <input
          name="title"
          required
          defaultValue={editing?.title}
          placeholder="Nome do serviço"
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
        />
      </div>
      <textarea
        name="description"
        defaultValue={editing?.description}
        placeholder="Descrição curta"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
      />

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
          {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar serviço'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function ServicosManager({ siteId, servicos, readOnly }: { siteId: string; servicos: Servico[]; readOnly: boolean }) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Servico>('none')
  const [erro, setErro] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteServico(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar serviço
        </button>
      )}
      {!readOnly && formOpen === 'new' && <ServicoForm siteId={siteId} editing={null} onDone={() => setFormOpen('none')} />}
      {!readOnly && formOpen !== 'none' && formOpen !== 'new' && <ServicoForm siteId={siteId} editing={formOpen} onDone={() => setFormOpen('none')} />}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {servicos.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum serviço cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {servicos.map(s => (
            <li key={s.id} className="py-3 flex items-center gap-3">
              <span className="text-xl w-8 text-center flex-shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)]">{s.title}</p>
                <p className="text-xs text-[var(--muted)] truncate">{s.description}</p>
              </div>
              {!readOnly && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setFormOpen(s)} className="text-xs font-semibold text-[var(--brand)]">Editar</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
