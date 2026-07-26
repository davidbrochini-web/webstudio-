import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getNiche } from '@/lib/templates'
import { seedSiteFromNiche } from '@/lib/site-seed'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Demo instantânea: visitante escolhe um nicho no /demo e cai direto
 * no /app/editor, sem digitar login nem senha. Por trás dos panos:
 *
 * 1. Login anônimo do Supabase (sessão de verdade, sem e-mail/senha)
 * 2. Tenant novo marcado is_demo=true (isolado — ninguém edita em
 *    cima do site de outro visitante)
 * 3. Site + conteúdo semeado a partir do template escolhido
 * 4. Membership (papel owner) + módulos Site e Cadastros ativos
 *
 * Usa o client de service_role pra criar tudo isso porque, no momento
 * da criação, o usuário anônimo ainda não tem membership nenhuma —
 * as policies normais de RLS (is_admin_of_tenant) bloqueariam.
 */
export async function GET(request: NextRequest) {
  try {
    const nichoSlug = request.nextUrl.searchParams.get('nicho')
    const niche = nichoSlug ? getNiche(nichoSlug) : null

    if (!niche) {
      return NextResponse.redirect(new URL('/demo?erro=nicho-invalido', request.url))
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

    if (authError || !authData.user) {
      return NextResponse.json({ stage: 'auth', error: authError?.message }, { status: 500 })
    }

    const userId = authData.user.id
    const admin = createAdminClient()
    const randomId = Math.random().toString(36).slice(2, 8)

    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({ nome: `Demo — ${niche.label}`, plano: 'demo', status: 'ativo', is_demo: true })
      .select('id')
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ stage: 'tenant', error: tenantError?.message }, { status: 500 })
    }

    const seedResult = await seedSiteFromNiche(admin, tenant.id, niche.slug, `demo-${randomId}`, 'publicado')

    if (seedResult.error || !seedResult.siteId) {
      await admin.from('tenants').delete().eq('id', tenant.id)
      return NextResponse.json({ stage: 'seed', error: seedResult.error }, { status: 500 })
    }

    const [membershipRes, subSiteRes, subCadastrosRes] = await Promise.all([
      admin.from('memberships').insert({ tenant_id: tenant.id, user_id: userId, papel: 'owner' }),
      admin.from('subscriptions').insert({ tenant_id: tenant.id, modulo: 'site', status: 'ativo' }),
      admin.from('subscriptions').insert({ tenant_id: tenant.id, modulo: 'cadastros', status: 'ativo' }),
    ])

    const setupError = membershipRes.error || subSiteRes.error || subCadastrosRes.error
    if (setupError) {
      await admin.from('tenants').delete().eq('id', tenant.id)
      return NextResponse.json({ stage: 'setup', error: setupError.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/app/editor?demo=1', request.url))
  } catch (err) {
    return NextResponse.json({ stage: 'catch', error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
