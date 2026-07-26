'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState, useTransition } from 'react'
import { createTenant, updateTenant, setTenantStatus, type TenantFormState } from '@/app/admin/tenants/actions'

interface Tenant {
  id: string
  nome: string
  cnpj: string | null
  plano: string
  status: string
  created_at: string
}

const statusStyle: Record<string, string> = {
  ativo: 'bg-green-50 text-[var(--green)]',
  suspenso: 'bg-amber-50 text-amber-600',
  cancelado: 'bg-red-50 text-red-600',
}

function TenantForm({
  tenant,
  onDone,
}: {
  tenant?: Tenant
  onDone: () => void
}) {
  const action = tenant ? updateTenant : createTenant
  const [state, formAction, pending] = useActionState<TenantFormState, FormData>(action, {})

  useEffect(() => {
    if (state.success) onDone()
  }, [state.success, onDone])

  return (
    <form action={formAction} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 mb-6">
      {tenant && <input type="hidden" name="id" value={tenant.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Nome *</label>
          <input
            name="nome"
            required
            defaultValue={tenant?.nome}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple)]"
            placeholder="Nome da empresa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">CNPJ</label>
          <input
            name="cnpj"
            defaultValue={tenant?.cnpj ?? ''}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple)]"
            placeholder="00.000.000/0001-00"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Plano</label>
        <select
          name="plano"
          defaultValue={tenant?.plano ?? 'trial'}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--purple)]"
        >
          <option value="trial">Trial</option>
          <option value="site">Site (R$149/mês)</option>
          <option value="site+modulos">Site + módulos</option>
          <option value="modulos">Só módulos</option>
        </select>
      </div>

      {state.error && <p className="text-sm text-red-600 mb-4">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 rounded-lg grad-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? 'Salvando...' : tenant ? 'Salvar alterações' : 'Criar tenant'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm font-semibold hover:bg-[var(--off)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function TenantsManager({ initialTenants }: { initialTenants: Tenant[] }) {
  const [formMode, setFormMode] = useState<'none' | 'new' | Tenant>('none')
  const [isPending, startTransition] = useTransition()

  function handleStatusToggle(tenant: Tenant) {
    const next = tenant.status === 'ativo' ? 'suspenso' : 'ativo'
    startTransition(() => {
      setTenantStatus(tenant.id, next)
    })
  }

  return (
    <div>
      {formMode === 'none' && (
        <button
          onClick={() => setFormMode('new')}
          className="mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg grad-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Novo tenant
        </button>
      )}

      {formMode === 'new' && (
        <TenantForm onDone={() => setFormMode('none')} />
      )}
      {formMode !== 'none' && formMode !== 'new' && (
        <TenantForm tenant={formMode} onDone={() => setFormMode('none')} />
      )}

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {initialTenants.length === 0 ? (
          <p className="text-sm text-[var(--muted)] p-6">Nenhum tenant cadastrado ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-5 py-3 font-medium text-[var(--muted)]">Nome</th>
                <th className="px-5 py-3 font-medium text-[var(--muted)] hidden sm:table-cell">Plano</th>
                <th className="px-5 py-3 font-medium text-[var(--muted)]">Status</th>
                <th className="px-5 py-3 font-medium text-[var(--muted)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialTenants.map(t => (
                <tr key={t.id}>
                  <td className="px-5 py-3 text-[var(--ink)] font-medium">
                    <Link href={`/admin/tenants/${t.id}`} className="hover:text-[var(--purple)] transition-colors">
                      {t.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted)] hidden sm:table-cell">{t.plano}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[t.status] ?? ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setFormMode(t)}
                      className="text-xs font-semibold text-[var(--purple)] mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleStatusToggle(t)}
                      disabled={isPending}
                      className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
                    >
                      {t.status === 'ativo' ? 'Suspender' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
