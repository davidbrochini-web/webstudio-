import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { PROJETO_ESPECIAL_APP_PATH } from '@/lib/current-tenant'

/**
 * GET /admin/impersonar/{tenantId} — superadmin "entra como" o tenant
 * pra ver o painel exatamente como o cliente vê (testar, corrigir
 * erro, entender uso real). Fica sob /admin, então o proxy.ts já
 * bloqueia isso pra quem não é superadmin antes de chegar aqui — a
 * checagem abaixo é defesa em profundidade, não a única barreira.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
  if (!profile?.is_super_admin) return NextResponse.redirect(new URL('/app', request.url))

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, projeto_especial_slug')
    .eq('id', tenantId)
    .is('deleted_at', null)
    .single()

  if (!tenant) return NextResponse.redirect(new URL('/admin/tenants', request.url))

  const cookieStore = await cookies()
  cookieStore.set('impersonate_tenant', tenant.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 4, // 4h — sessão de suporte, expira sozinha
  })

  const destino = tenant.projeto_especial_slug
    ? (PROJETO_ESPECIAL_APP_PATH[tenant.projeto_especial_slug] ?? '/app')
    : '/app'

  return NextResponse.redirect(new URL(destino, request.url))
}
