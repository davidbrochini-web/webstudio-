'use client'

import { useState, useTransition } from 'react'
import { toggleModule } from '@/app/admin/tenants/[id]/actions'
import { modules, formatPreco } from '@/lib/modules'

interface Subscription {
  modulo: string
  status: string
}

export default function TenantModulesManager({
  tenantId,
  subscriptions,
}: {
  tenantId: string
  subscriptions: Subscription[]
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function isAtivo(slug: string) {
    return subscriptions.find(s => s.modulo === slug)?.status === 'ativo'
  }

  function handleToggle(slug: string, checked: boolean) {
    setErro(null)
    startTransition(async () => {
      try {
        await toggleModule(tenantId, slug, checked)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao atualizar módulo.')
      }
    })
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">Módulos</h2>
      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}
      <ul className="flex flex-col gap-1">
        {modules.map(({ slug, label, disponivel, preco }) => {
          const ativo = isAtivo(slug)
          return (
            <li key={slug} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
              <span className={`text-sm ${disponivel ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                {label}
                {preco != null && <span className="ml-2 text-xs text-[var(--muted)]">R$&thinsp;{formatPreco(preco)}/mês</span>}
                {!disponivel && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[var(--brand)]">em breve</span>}
              </span>
              <label className={`relative inline-flex items-center ${disponivel ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                <input
                  type="checkbox"
                  checked={ativo}
                  disabled={isPending || !disponivel}
                  onChange={e => handleToggle(slug, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--border)] peer-checked:bg-[var(--green)] rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
