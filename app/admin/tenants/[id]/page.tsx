import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TenantUsersManager from '@/components/admin/TenantUsersManager'
import TenantModulesManager from '@/components/admin/TenantModulesManager'
import TenantSiteManager from '@/components/admin/TenantSiteManager'

export default async function TenantDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, nome, cnpj, plano, status')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!tenant) notFound()

  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, papel, user_id, profiles(nome)')
    .eq('tenant_id', id)

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('modulo, status')
    .eq('tenant_id', id)
    .is('deleted_at', null)

  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, business_name, status')
    .eq('tenant_id', id)
    .is('deleted_at', null)
    .maybeSingle()

  // Busca o e-mail de cada membro (não fica em profiles, fica em auth.users —
  // usamos a mesma query server-side, o service_role não é necessário pra
  // leitura própria via join, mas auth.users não é exposto via PostgREST
  // por padrão, então buscamos separadamente se precisar. Por ora, omitimos
  // o e-mail na listagem — só o nome e papel já bastam pra Etapa 3.)

  return (
    <div>
      <Link href="/admin/tenants" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">
        ← Voltar
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">{tenant.nome}</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--off)] text-[var(--muted)]">
          {tenant.status}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)] mb-8">
        {tenant.cnpj ?? 'CNPJ não informado'} · plano: {tenant.plano}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TenantSiteManager tenantId={tenant.id} site={site ?? null} />
        <TenantUsersManager
          tenantId={tenant.id}
          memberships={(memberships ?? []).map(m => ({
            id: m.id,
            papel: m.papel,
            nome: (m.profiles as unknown as { nome: string } | null)?.nome ?? '(sem nome)',
          }))}
        />
        <TenantModulesManager tenantId={tenant.id} subscriptions={subscriptions ?? []} />
      </div>
    </div>
  )
}
