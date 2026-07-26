'use client'

import { useTransition } from 'react'
import { toggleModule } from '@/app/admin/tenants/[id]/actions'

const modulos = [
  { slug: 'site', label: 'Site + Instagram' },
  { slug: 'cadastros', label: 'Cadastros' },
  { slug: 'crm', label: 'CRM' },
  { slug: 'estoque', label: 'Controle de estoque' },
  { slug: 'contas_pagar', label: 'Contas a pagar' },
  { slug: 'contas_receber', label: 'Contas a receber' },
  { slug: 'fluxo_caixa', label: 'Fluxo de caixa' },
]

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

  function isAtivo(slug: string) {
    return subscriptions.find(s => s.modulo === slug)?.status === 'ativo'
  }

  function handleToggle(slug: string, checked: boolean) {
    startTransition(() => {
      toggleModule(tenantId, slug, checked)
    })
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">Módulos</h2>
      <ul className="flex flex-col gap-1">
        {modulos.map(({ slug, label }) => {
          const ativo = isAtivo(slug)
          return (
            <li key={slug} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
              <span className="text-sm text-[var(--ink)]">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ativo}
                  disabled={isPending}
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
