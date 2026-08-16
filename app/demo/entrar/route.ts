import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Entrada na demo criada pelo atendente (ver criarDemoParaLead em
 * app/admin/crm/actions.ts). Substitui o antigo /demo/iniciar
 * público — aqui o tenant/site JÁ existe, criado durante a
 * negociação com o lead; essa rota só autentica quem tem o link
 * (token) e amarra uma sessão anônima nova a ele.
 *
 * Sem token válido não acontece nada — não é mais possível criar
 * tenant demo direto por essa rota (era a origem do problema:
 * qualquer visitante podia gerar quantos quisesse).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/?erro=demo-invalida', request.url))
  }

  const admin = createAdminClient()
  const { data: tenant } = await admin
    .from('tenants')
    .select('id')
    .eq('demo_token', token)
    .eq('is_demo', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (!tenant) {
    return NextResponse.redirect(new URL('/?erro=demo-invalida', request.url))
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

  if (authError || !authData.user) {
    return NextResponse.redirect(new URL('/?erro=demo-invalida', request.url))
  }

  const userId = authData.user.id

  // Mesmo motivo do fluxo antigo: memberships.user_id tem FK pra
  // profiles(id), sem trigger automática criando profile no login.
  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: userId, nome: 'Visitante (demo)' })

  if (profileError) {
    return NextResponse.redirect(new URL('/?erro=demo-invalida', request.url))
  }

  const { error: membershipError } = await admin
    .from('memberships')
    .insert({ tenant_id: tenant.id, user_id: userId, papel: 'owner' })

  if (membershipError) {
    return NextResponse.redirect(new URL('/?erro=demo-invalida', request.url))
  }

  return NextResponse.redirect(new URL('/app/editor?demo=1', request.url))
}
