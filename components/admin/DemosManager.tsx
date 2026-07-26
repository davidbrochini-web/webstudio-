'use client'

import { useState } from 'react'
import { deleteDemoTenant } from '@/app/admin/tenants/demos/actions'

export interface DemoTenant {
  id: string
  nome: string
  created_at: string
  site: { slug: string; pagelayout: string } | null
}

export default function DemosManager({ tenants: initialTenants }: { tenants: DemoTenant[] }) {
  const [tenants, setTenants] = useState(initialTenants)
  const [erro, setErro] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setErro(null)
    setPendingId(id)
    try {
      await deleteDemoTenant(id)
      setTenants(list => list.filter(t => t.id !== id))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao apagar.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-base text-[var(--ink)]">
          Tenants demo ({tenants.length})
        </h2>
        {tenants.length > 0 && (
          <button
            onClick={async () => {
              setErro(null)
              try {
                await Promise.all(tenants.map(t => deleteDemoTenant(t.id)))
                setTenants([])
              } catch (err) {
                setErro(err instanceof Error ? err.message : 'Erro ao apagar todas.')
              }
            }}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Apagar todas
          </button>
        )}
      </div>

      {erro && <p className="text-xs text-red-600 mb-3">{erro}</p>}

      {tenants.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma demo ativa no momento.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {tenants.map(t => (
            <li key={t.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)] truncate">{t.nome}</p>
                <p className="text-xs text-[var(--muted)]">
                  {t.site?.pagelayout ?? '—'} · {new Date(t.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {t.site && (
                  <a
                    href={`/sandbox/${t.site.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-[var(--brand)]"
                  >
                    Ver
                  </a>
                )}
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={pendingId === t.id}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-red-600 disabled:opacity-50"
                >
                  {pendingId === t.id ? 'Apagando...' : 'Apagar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
