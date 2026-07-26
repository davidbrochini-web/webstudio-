import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminHome() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, status')
    .is('deleted_at', null)

  const total = tenants?.length ?? 0
  const ativos = tenants?.filter(t => t.status === 'ativo').length ?? 0

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          <span className="font-display font-extrabold text-3xl text-[var(--ink)] block">{total}</span>
          <span className="text-sm text-[var(--muted)]">tenants no total</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          <span className="font-display font-extrabold text-3xl text-[var(--green)] block">{ativos}</span>
          <span className="text-sm text-[var(--muted)]">tenants ativos</span>
        </div>
      </div>

      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--purple)]"
      >
        Gerenciar tenants →
      </Link>
    </div>
  )
}
