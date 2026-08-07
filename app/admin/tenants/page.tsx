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

  const tenantIds = (tenants ?? []).map(t => t.id)

  // Contadores por tenant pra exibir nos cards — 3 queries pequenas
  // (tabelas cabem inteiras em memória hoje) em vez de 1 por tenant,
  // pra não virar N+1 conforme a base de tenants crescer.
  const [{ data: subs }, { data: sites }, { data: clientesRows }] = tenantIds.length
    ? await Promise.all([
        supabase.from('subscriptions').select('tenant_id, modulo').in('tenant_id', tenantIds).eq('status', 'ativo').is('deleted_at', null),
        supabase.from('sites').select('tenant_id, status').in('tenant_id', tenantIds).is('deleted_at', null),
        supabase.from('clientes').select('tenant_id').in('tenant_id', tenantIds).is('deleted_at', null),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const modulosPorTenant = new Map<string, number>()
  subs?.forEach(s => modulosPorTenant.set(s.tenant_id, (modulosPorTenant.get(s.tenant_id) ?? 0) + 1))

  const sitePorTenant = new Map<string, string>()
  sites?.forEach(s => sitePorTenant.set(s.tenant_id, s.status))

  const clientesPorTenant = new Map<string, number>()
  clientesRows?.forEach(c => clientesPorTenant.set(c.tenant_id, (clientesPorTenant.get(c.tenant_id) ?? 0) + 1))

  const tenantsComStats = (tenants ?? []).map(t => ({
    ...t,
    modulosAtivos: modulosPorTenant.get(t.id) ?? 0,
    siteStatus: sitePorTenant.get(t.id) ?? null,
    clientesCount: clientesPorTenant.get(t.id) ?? 0,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">
          Clientes
        </h1>
        {!!demoCount && (
          <Link href="/admin/tenants/demos" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            {demoCount} demo{demoCount === 1 ? '' : 's'} ativa{demoCount === 1 ? '' : 's'} →
          </Link>
        )}
      </div>
      <TenantsManager initialTenants={tenantsComStats} />
    </div>
  )
}
