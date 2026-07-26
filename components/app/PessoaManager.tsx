'use client'

import { useActionState, useState } from 'react'
import { upsertCliente, deleteCliente, upsertFornecedor, deleteFornecedor, type CadastroFormState } from '@/app/app/cadastros/actions'

export interface Pessoa {
  id: string
  tipo_pessoa: 'fisica' | 'juridica'
  nome: string
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  status: 'ativo' | 'inativo'
  observacoes: string | null
}

interface Props {
  tenantId: string
  pessoas: Pessoa[]
  readOnly: boolean
  tipo: 'cliente' | 'fornecedor'
}

export default function PessoaManager({ tenantId, pessoas, readOnly, tipo }: Props) {
  const upsertAction = tipo === 'cliente' ? upsertCliente : upsertFornecedor
  const deleteAction = tipo === 'cliente' ? deleteCliente : deleteFornecedor
  const label = tipo === 'cliente' ? 'cliente' : 'fornecedor'

  const [formOpen, setFormOpen] = useState<'none' | 'new' | Pessoa>('none')
  const [erro, setErro] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<CadastroFormState, FormData>(upsertAction, {})

  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.success) setFormOpen('none')
  }

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await deleteAction(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  const editing = formOpen !== 'none' && formOpen !== 'new' ? formOpen : null

  return (
    <div>
      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar {label}
        </button>
      )}

      {!readOnly && formOpen !== 'none' && (
        <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-5 max-w-lg">
          <input type="hidden" name="tenant_id" value={tenantId} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="grid grid-cols-2 gap-3">
            <select name="tipo_pessoa" defaultValue={editing?.tipo_pessoa ?? 'juridica'} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
              <option value="juridica">Pessoa jurídica</option>
              <option value="fisica">Pessoa física</option>
            </select>
            <select name="status" defaultValue={editing?.status ?? 'ativo'} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <input name="nome" required defaultValue={editing?.nome} placeholder="Nome / razão social" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="cpf_cnpj" defaultValue={editing?.cpf_cnpj ?? ''} placeholder="CPF/CNPJ" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            <input name="telefone" defaultValue={editing?.telefone ?? ''} placeholder="Telefone" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>
          <input name="email" type="email" defaultValue={editing?.email ?? ''} placeholder="E-mail" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          <textarea name="observacoes" defaultValue={editing?.observacoes ?? ''} placeholder="Observações" rows={2} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50">
              {pending ? 'Salvando...' : editing ? 'Salvar alterações' : `Adicionar ${label}`}
            </button>
            <button type="button" onClick={() => setFormOpen('none')} className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {pessoas.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum {label} cadastrado ainda.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Nome</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] hidden sm:table-cell">Contato</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Status</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {pessoas.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{p.nome}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)] hidden sm:table-cell">{p.telefone || p.email || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'ativo' ? 'bg-green-50 text-[var(--green)]' : 'bg-[var(--off)] text-[var(--muted)]'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!readOnly && (
                      <>
                        <button onClick={() => setFormOpen(p)} className="text-xs font-semibold text-[var(--brand)] mr-3">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
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
