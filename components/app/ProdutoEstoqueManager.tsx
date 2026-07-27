'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { atualizarEstoqueMinimo } from '@/app/app/(hub)/estoque/actions'

export interface ProdutoEstoque {
  id: string
  nome: string
  sku: string | null
  unidade: string | null
  estoque_minimo: number | null
  saldo: number
}

export default function ProdutoEstoqueManager({
  produtos,
  readOnly,
}: {
  produtos: ProdutoEstoque[]
  readOnly: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleSalvarMinimo(produtoId: string, valorStr: string) {
    setErro(null)
    const valor = valorStr.trim() === '' ? null : parseInt(valorStr, 10)
    if (valor !== null && (!Number.isInteger(valor) || valor < 0)) {
      setErro('Estoque mínimo precisa ser um número inteiro válido.')
      return
    }
    startTransition(async () => {
      try {
        await atualizarEstoqueMinimo(produtoId, valor)
        setEditingId(null)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao salvar.')
      }
    })
  }

  const abaixoMinimo = produtos.filter(p => p.estoque_minimo != null && p.saldo < p.estoque_minimo)

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--off)] rounded-xl p-4">
          <p className="text-xs text-[var(--muted)] mb-1">Produtos com controle de estoque</p>
          <p className="font-display font-bold text-lg text-[var(--ink)]">{produtos.length}</p>
        </div>
        <div className={`rounded-xl p-4 ${abaixoMinimo.length ? 'bg-red-50' : 'bg-[var(--off)]'}`}>
          <p className="text-xs text-[var(--muted)] mb-1">Abaixo do mínimo</p>
          <p className={`font-display font-bold text-lg ${abaixoMinimo.length ? 'text-red-600' : 'text-[var(--ink)]'}`}>
            {abaixoMinimo.length}
          </p>
        </div>
      </div>

      {!readOnly && (
        <Link href="/app/estoque/movimentacoes" className="mb-4 inline-block text-sm font-semibold text-[var(--brand)]">
          + Registrar entrada ou saída
        </Link>
      )}

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {produtos.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nenhum produto cadastrado ainda. Cadastre produtos em Cadastros → Produtos/Serviços (só itens do tipo &quot;produto&quot; aparecem aqui).
        </p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Produto</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] hidden sm:table-cell">SKU</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Saldo</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)] text-right">Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {produtos.map(p => {
                const abaixo = p.estoque_minimo != null && p.saldo < p.estoque_minimo
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 text-[var(--ink)] font-medium">
                      {p.nome}
                      {abaixo && <span className="ml-2 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">baixo</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted)] hidden sm:table-cell">{p.sku || '—'}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${abaixo ? 'text-red-600' : 'text-[var(--ink)]'}`}>
                      {p.saldo} {p.unidade || ''}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {readOnly ? (
                        p.estoque_minimo ?? '—'
                      ) : editingId === p.id ? (
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          defaultValue={p.estoque_minimo ?? ''}
                          disabled={isPending}
                          onBlur={e => handleSalvarMinimo(p.id, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          className="w-20 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--off)] text-sm text-right"
                        />
                      ) : (
                        <button onClick={() => setEditingId(p.id)} className="text-[var(--muted)] hover:text-[var(--brand)]">
                          {p.estoque_minimo ?? 'definir'}
                        </button>
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
