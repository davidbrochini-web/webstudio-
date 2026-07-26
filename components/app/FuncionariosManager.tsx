'use client'

import { useActionState, useState } from 'react'
import { upsertFuncionario, deleteFuncionario, type CadastroFormState } from '@/app/app/cadastros/actions'

export interface Funcionario {
  id: string
  nome: string
  cpf: string | null
  cargo: string | null
  admissao: string | null
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  observacoes: string | null
}

export default function FuncionariosManager({ tenantId, funcionarios, readOnly }: { tenantId: string; funcionarios: Funcionario[]; readOnly: boolean }) {
  const [formOpen, setFormOpen] = useState<'none' | 'new' | Funcionario>('none')
  const [erro, setErro] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<CadastroFormState, FormData>(upsertFuncionario, {})

  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.success) setFormOpen('none')
  }

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteFuncionario(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  const editing = formOpen !== 'none' && formOpen !== 'new' ? formOpen : null

  return (
    <div>
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar funcionário
        </button>
      )}

      {!readOnly && formOpen !== 'none' && (
        <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-5 max-w-lg">
          <input type="hidden" name="tenant_id" value={tenantId} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <input name="nome" required defaultValue={editing?.nome} placeholder="Nome completo" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="cargo" defaultValue={editing?.cargo ?? ''} placeholder="Cargo" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            <input name="cpf" defaultValue={editing?.cpf ?? ''} placeholder="CPF" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Admissão</label>
              <input name="admissao" type="date" defaultValue={editing?.admissao ?? ''} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            </div>
            <select name="status" defaultValue={editing?.status ?? 'ativo'} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm self-end">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="telefone" defaultValue={editing?.telefone ?? ''} placeholder="Telefone" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            <input name="email" type="email" defaultValue={editing?.email ?? ''} placeholder="E-mail" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>
          <textarea name="observacoes" defaultValue={editing?.observacoes ?? ''} placeholder="Observações" rows={2} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
              {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar funcionário'}
            </button>
            <button type="button" onClick={() => setFormOpen('none')} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {funcionarios.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum funcionário cadastrado ainda.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Nome</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] hidden sm:table-cell">Cargo</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Status</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {funcionarios.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{f.nome}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)] hidden sm:table-cell">{f.cargo || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.status === 'ativo' ? 'bg-green-50 text-[var(--green)]' : 'bg-[var(--off)] text-[var(--muted)]'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!readOnly && (
                      <>
                        <button onClick={() => setFormOpen(f)} className="text-xs font-semibold text-[var(--brand)] mr-3">Editar</button>
                        <button onClick={() => handleDelete(f.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
