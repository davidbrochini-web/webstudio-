'use client'

import { useActionState, useState } from 'react'
import {
  upsertContaPagar, deleteContaPagar,
  upsertContaReceber, deleteContaReceber,
  type FinanceiroFormState,
} from '@/app/app/(hub)/financeiro/actions'

export interface Parte {
  id: string
  nome: string
}

export interface Conta {
  id: string
  fornecedor_id?: string | null
  cliente_id?: string | null
  descricao: string
  categoria: string | null
  valor: number
  vencimento: string
  data_pagamento?: string | null
  data_recebimento?: string | null
  status: string
  observacoes: string | null
}

interface Props {
  tenantId: string
  contas: Conta[]
  partes: Parte[]
  readOnly: boolean
  tipo: 'pagar' | 'receber'
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ContaManager({ tenantId, contas, partes, readOnly, tipo }: Props) {
  const isPagar = tipo === 'pagar'
  const upsertAction = isPagar ? upsertContaPagar : upsertContaReceber
  const deleteAction = isPagar ? deleteContaPagar : deleteContaReceber
  const parteField = isPagar ? 'fornecedor_id' : 'cliente_id'
  const dataField = isPagar ? 'data_pagamento' : 'data_recebimento'
  const statusPago = isPagar ? 'pago' : 'recebido'
  const parteLabel = isPagar ? 'Fornecedor' : 'Cliente'

  const [formOpen, setFormOpen] = useState<'none' | 'new' | Conta>('none')
  const [erro, setErro] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState<FinanceiroFormState, FormData>(upsertAction, {})

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
  const today = new Date().toISOString().slice(0, 10)

  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((s, c) => s + Number(c.valor), 0)
  const vencidas = contas.filter(c => c.status === 'pendente' && c.vencimento < today)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--off)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-1">Total pendente</p>
          <p className="font-display font-bold text-lg text-[var(--ink)]">{formatBRL(totalPendente)}</p>
        </div>
        <div className={`rounded-xl p-4 ${vencidas.length ? 'bg-red-50' : 'bg-[var(--off)]'}`}>
          <p className="text-xs text-[var(--muted)] mb-1">Vencidas</p>
          <p className={`font-display font-bold text-lg ${vencidas.length ? 'text-red-600' : 'text-[var(--ink)]'}`}>
            {vencidas.length}
          </p>
        </div>
      </div>

      {!readOnly && formOpen === 'none' && (
        <button onClick={() => setFormOpen('new')} className="mb-4 text-sm font-semibold text-[var(--brand)]">
          + Adicionar conta a {tipo}
        </button>
      )}

      {!readOnly && formOpen !== 'none' && (
        <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-5 max-w-lg">
          <input type="hidden" name="tenant_id" value={tenantId} />
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <input name="descricao" required defaultValue={editing?.descricao} placeholder="Descrição" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <select name={parteField} defaultValue={editing?.[parteField as 'fornecedor_id' | 'cliente_id'] ?? ''} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
              <option value="">{parteLabel} (opcional)</option>
              {partes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <input name="categoria" defaultValue={editing?.categoria ?? ''} placeholder="Categoria (opcional)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="valor" required type="text" inputMode="decimal" defaultValue={editing?.valor} placeholder="Valor (ex: 150,00)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            <input name="vencimento" required type="date" defaultValue={editing?.vencimento} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select name="status" defaultValue={editing?.status ?? 'pendente'} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
              <option value="pendente">Pendente</option>
              <option value={statusPago}>{isPagar ? 'Pago' : 'Recebido'}</option>
            </select>
            <input name="data_baixa" type="date" defaultValue={editing?.[dataField as 'data_pagamento' | 'data_recebimento'] ?? ''} placeholder={isPagar ? 'Data do pagamento' : 'Data do recebimento'} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>

          <textarea name="observacoes" defaultValue={editing?.observacoes ?? ''} placeholder="Observações" rows={2} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex gap-2">
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

      {contas.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma conta a {tipo} cadastrada ainda.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Descrição</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] hidden sm:table-cell">Vencimento</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Valor</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Status</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {contas.map(c => {
                const venceu = c.status === 'pendente' && c.vencimento < today
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{c.descricao}</td>
                    <td className={`px-4 py-2.5 hidden sm:table-cell ${venceu ? 'text-red-600 font-semibold' : 'text-[var(--muted)]'}`}>
                      {new Date(c.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-[var(--ink)]">{formatBRL(Number(c.valor))}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.status === 'pendente'
                          ? venceu ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-[var(--green)]'
                      }`}>
                        {c.status === 'pendente' ? (venceu ? 'Vencida' : 'Pendente') : (isPagar ? 'Pago' : 'Recebido')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {!readOnly && (
                        <>
                          <button onClick={() => setFormOpen(c)} className="text-xs font-semibold text-[var(--brand)] mr-3">Editar</button>
                          <button onClick={() => handleDelete(c.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">Remover</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
