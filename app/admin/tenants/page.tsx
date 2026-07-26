import { createClient } from '@/lib/supabase/server'
import TenantsManager from '@/components/admin/TenantsManager'

export default async function TenantsPage() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome, cnpj, plano, status, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">
        Tenants
      </h1>
      <TenantsManager initialTenants={tenants ?? []} />
    </div>
  )
}
