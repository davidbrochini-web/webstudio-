'use client'

import { useActionState, useEffect, useState } from 'react'
import { createTenantUser, updateMembershipRole, type UserFormState } from '@/app/admin/tenants/[id]/actions'

interface Membership {
  id: string
  papel: string
  nome: string
}

function generateSenha() {
  return Math.random().toString(36).slice(-4) + Math.random().toString(36).slice(-4).toUpperCase() + '!9'
}

export default function TenantUsersManager({
  tenantId,
  memberships,
}: {
  tenantId: string
  memberships: Membership[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [senha, setSenha] = useState(generateSenha())
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(createTenantUser, {})

  useEffect(() => {
    if (state.success) {
      setShowForm(false)
      setSenha(generateSenha())
    }
  }, [state.success])

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-base text-[var(--ink)]">
          Usuários ({memberships.length})
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[var(--purple)]"
          >
            + Novo usuário
          </button>
        )}
      </div>

      {showForm && (
        <form action={formAction} className="mb-5 flex flex-col gap-3 bg-[var(--off)] rounded-xl p-4">
          <input type="hidden" name="tenant_id" value={tenantId} />

          <input
            name="nome"
            required
            placeholder="Nome do usuário"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="email@cliente.com"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
          />
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Senha provisória (repasse ao cliente)</label>
            <input
              name="senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm font-mono"
            />
          </div>
          <select
            name="papel"
            defaultValue="owner"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--ink)] text-sm"
          >
            <option value="owner">Owner (acesso total)</option>
            <option value="admin">Admin</option>
            <option value="operador">Operador (só leitura)</option>
          </select>

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 rounded-lg grad-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Criando...' : 'Criar usuário'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {memberships.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum usuário vinculado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {memberships.map(m => (
            <li key={m.id} className="py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--ink)]">{m.nome}</span>
              <select
                defaultValue={m.papel}
                onChange={e => updateMembershipRole(m.id, e.target.value, tenantId)}
                className="text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-[var(--muted)]"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="operador">Operador</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
