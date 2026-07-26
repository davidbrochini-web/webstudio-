import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface CurrentTenantInfo {
  tenantId: string
  tenantNome: string
  papel: string
  siteId: string | null
  siteSlug: string | null
}

/**
 * Resolve o tenant do usuário logado — usado em toda página de
 * /app/* que precisa saber "de qual empresa é essa pessoa".
 * Redireciona pro /login se não tiver sessão; devolve null se a
 * conta não estiver vinculada a nenhum tenant (o chamador decide
 * como tratar esse caso, geralmente mostrando um aviso amigável).
 */
export async function getCurrentTenant(): Promise<CurrentTenantInfo | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('papel, tenants(id, nome)')
    .eq('user_id', user.id)
    .single()

  const tenant = membership?.tenants as unknown as { id: string; nome: string } | null
  if (!tenant) return null

  const { data: site } = await supabase
    .from('sites')
    .select('id, slug')
    .eq('tenant_id', tenant.id)
    .is('deleted_at', null)
    .maybeSingle()

  return {
    tenantId: tenant.id,
    tenantNome: tenant.nome,
    papel: membership!.papel,
    siteId: site?.id ?? null,
    siteSlug: site?.slug ?? null,
  }
}
