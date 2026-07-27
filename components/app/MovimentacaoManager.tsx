'use client'

import { useActionState, useState } from 'react'
import { registrarMovimentacao, excluirMovimentacao, type EstoqueFormState } from '@/app/app/(hub)/estoque/actions'

export interface ProdutoOpcao {
  id: string
  nome: string
  unidade: string | null
}

export interface Movimentacao {
  id: string
  produto_id: string
  produtoNome: string
  tipo: string
  quantidade: number
  motivo: string | null
  data: string
  observacoes: string | null
}

export default function MovimentacaoManager({
  tenantId,
  produtos,
  movimentacoes,
  readOnly,
}: {
  tenantId: string
  produtos: ProdutoOpcao[]
  movimentacoes: Movimentacao[]
  readOnly: boolean
}) {
  const [state, formAction, pending] = useActionState<EstoqueFormState, FormData>(registrarMovimentacao, {})
  const [erro, setErro] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  async function handleDelete(id: string) {
    setErro(null)
    try {
      await excluirMovimentacao(id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover.')
    }
  }

  return (
    <div>
      {!readOnly && (
        <form action={formAction} className="bg-[var(--off)] rounded-xl p-4 flex flex-col gap-3 mb-6 max-w-lg">
          <input type="hidden" name="tenant_id" value={tenantId} />

          <select name="produto_id" required defaultValue="" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
            <option value="" disabled>Selecione o produto</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select name="tipo" defaultValue="entrada" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <input name="quantidade" required type="number" min={1} step={1} placeholder="Quantidade" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="motivo" placeholder="Motivo (ex: compra, venda, perda)" className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
            <input name="data" type="date" defaultValue={today} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm" />
          </div>

          <textarea name="observacoes" placeholder="Observações (opcional)" rows={2} className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm resize-none" />

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}

          <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 self-start">
            {pending ? 'Registrando...' : 'Registrar movimentação'}
          </button>
        </form>
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {movimentacoes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma movimentação registrada ainda.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Data</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Produto</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Tipo</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Qtd</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] hidden sm:table-cell">Motivo</th>
                {!readOnly && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {movimentacoes.map(m => (
                <tr key={m.id}>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{m.produtoNome}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.tipo === 'entrada' ? 'bg-green-50 text-[var(--green)]' : 'bg-amber-50 text-amber-700'}`}>
                      {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink)]">{m.quantidade}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)] hidden sm:table-cell">{m.motivo || '—'}</td>
                  {!readOnly && (
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleDelete(m.id)} className="text-xs font-semibold text-[var(--muted)] hover:text-red-600">
                        Remover
                      </button>
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
