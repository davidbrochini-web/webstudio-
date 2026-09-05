import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export interface CurrentTenantInfo {
  tenantId: string
  tenantNome: string
  papel: string
  siteId: string | null
  siteSlug: string | null
  isDemo: boolean
  projetoEspecialSlug: string | null
  /** true quando quem está vendo é um superadmin "entrando como" esse
   *  tenant (ver /admin/impersonar/[tenantId]) — não é o dono de verdade. */
  impersonating: boolean
}

/** Caminho de entrada do painel de cada Projeto Especial — usado pelo
 *  redirect de impersonação e reaproveitável onde mais precisar. */
export const PROJETO_ESPECIAL_APP_PATH: Record<string, string> = {
  'dentista-joao': '/app/projeto-especial',
  'casos-esquecidos': '/app/casos-esquecidos',
  'localdesk': '/app/localdesk',
  'colegio-elite': '/app/colegio-elite',
}

interface TenantRow {
  id: string
  nome: string
  is_demo: boolean
  projeto_especial_slug: string | null
}

/**
 * Resolve o tenant do usuário logado — usado em toda página de
 * /app/* que precisa saber "de qual empresa é essa pessoa".
 * Redireciona pro /login se não tiver sessão; devolve null se a
 * conta não estiver vinculada a nenhum tenant (o chamador decide
 * como tratar esse caso, geralmente mostrando um aviso amigável).
 *
 * Suporta impersonação: se existir o cookie `impersonate_tenant` E o
 * usuário logado for de fato superadmin (checado no banco a cada
 * chamada — nunca confiar só no cookie, ele podia ter sido fabricado
 * por qualquer client), resolve pro tenant do cookie em vez da
 * membership própria, com papel 'owner' (acesso total, pra David
 * conseguir reproduzir e corrigir problemas como se fosse o cliente).
 */
export async function getCurrentTenant(): Promise<CurrentTenantInfo | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const impersonateId = cookieStore.get('impersonate_tenant')?.value

  let tenantRow: TenantRow | null = null
  let papel = 'owner'
  let impersonating = false

  if (impersonateId) {
    const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
    if (profile?.is_super_admin) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, nome, is_demo, projeto_especial_slug')
        .eq('id', impersonateId)
        .is('deleted_at', null)
        .single()
      if (tenant) {
        tenantRow = tenant
        impersonating = true
      }
    }
  }

  if (!tenantRow) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('papel, tenants(id, nome, is_demo, projeto_especial_slug)')
      .eq('user_id', user.id)
      .single()

    const tenant = membership?.tenants as unknown as TenantRow | null
    if (!tenant) return null
    tenantRow = tenant
    papel = membership!.papel
  }

  const { data: site } = await supabase
    .from('sites')
    .select('id, slug')
    .eq('tenant_id', tenantRow.id)
    .is('deleted_at', null)
    .maybeSingle()

  return {
    tenantId: tenantRow.id,
    tenantNome: tenantRow.nome,
    papel,
    siteId: site?.id ?? null,
    siteSlug: site?.slug ?? null,
    isDemo: tenantRow.is_demo,
    projetoEspecialSlug: tenantRow.projeto_especial_slug,
    impersonating,
  }
}

