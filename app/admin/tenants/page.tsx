import { createClient } from '@/lib/supabase/server'
import TenantsManager from '@/components/admin/TenantsManager'
import Link from 'next/link'

export default async function TenantsPage() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome, cnpj, plano, status, created_at')
    .is('deleted_at', null)
    .eq('is_demo', false)
    .order('created_at', { ascending: false })

  const { count: demoCount } = await supabase
    .from('tenants')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('is_demo', true)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">
          Tenants
        </h1>
        {!!demoCount && (
          <Link href="/admin/tenants/demos" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            {demoCount} demo{demoCount === 1 ? '' : 's'} ativa{demoCount === 1 ? '' : 's'} →
          </Link>
        )}
      </div>
      <TenantsManager initialTenants={tenants ?? []} />
    </div>
  )
}
