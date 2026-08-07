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
  modulosAtivos?: number
  siteStatus?: string | null
  clientesCount?: number
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
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="Nome da empresa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">CNPJ</label>
          <input
            name="cnpj"
            defaultValue={tenant?.cnpj ?? ''}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            placeholder="00.000.000/0001-00"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Plano</label>
        <select
          name="plano"
          defaultValue={tenant?.plano ?? 'trial'}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          <option value="trial">Trial</option>
          <option value="site">Site (sob consulta)</option>
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
          + Novo cliente
        </button>
      )}

      {formMode === 'new' && (
        <TenantForm onDone={() => setFormMode('none')} />
      )}
      {formMode !== 'none' && formMode !== 'new' && (
        <TenantForm tenant={formMode} onDone={() => setFormMode('none')} />
      )}

      {initialTenants.length === 0 ? (
        <p className="text-sm text-[var(--muted)] p-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl">
          Nenhum tenant cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialTenants.map(t => (
            <div key={t.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <Link href={`/admin/tenants/${t.id}`} className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[var(--off)] flex items-center justify-center text-lg flex-shrink-0">
                    🏢
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display font-bold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors truncate">
                      {t.nome}
                    </span>
                    <span className="block text-xs text-[var(--muted)] truncate">{t.cnpj || 'sem CNPJ cadastrado'}</span>
                  </span>
                </Link>
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                  t.status === 'ativo' ? 'bg-[var(--green)]' : t.status === 'suspenso' ? 'bg-amber-500' : 'bg-red-500'
                }`} title={t.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center">
                  <span className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 font-display font-bold text-sm flex items-center justify-center">
                    {t.modulosAtivos ?? 0}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold uppercase tracking-wide mt-1.5">Módulos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 font-display font-bold text-sm flex items-center justify-center">
                    {t.clientesCount ?? 0}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold uppercase tracking-wide mt-1.5">Clientes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`w-11 h-11 rounded-full font-display font-bold text-[10px] flex items-center justify-center text-center leading-tight ${
                    t.siteStatus === 'publicado' ? 'bg-green-50 text-[var(--green)]' : t.siteStatus ? 'bg-amber-50 text-amber-600' : 'bg-[var(--off)] text-[var(--muted)]'
                  }`}>
                    {t.siteStatus === 'publicado' ? 'no ar' : t.siteStatus ? 'rascunho' : 'sem site'}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-semibold uppercase tracking-wide mt-1.5">Site</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--muted)]">Plano: <strong className="text-[var(--ink)]">{t.plano}</strong></span>
                <div>
                  <button onClick={() => setFormMode(t)} className="text-xs font-semibold text-[var(--brand)] mr-3">
                    Editar
                  </button>
                  <button
                    onClick={() => handleStatusToggle(t)}
                    disabled={isPending}
                    className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
                  >
                    {t.status === 'ativo' ? 'Suspender' : 'Reativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
