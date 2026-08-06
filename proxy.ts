import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Domínios customizados dos Projetos Especiais → rewrite transparente
// pra dentro do path real do site na app Next.js. Usa rewrite (não
// redirect) pra manter a URL limpa no browser do paciente.
const DOMAIN_MAP: Record<string, string> = {
  'drjoaobucomaxilofacial.com.br': '/projetos-especiais/dentista-joao',
  'www.drjoaobucomaxilofacial.com.br': '/projetos-especiais/dentista-joao',
  // Casos Esquecidos (Projeto Especial #2) — entrada preparada, mas o
  // DNS de casosesquecidos.com.br ainda aponta pro projeto Vercel antigo
  // até o David validar o site migrado. Ver HANDOFF-casosesquecidos.
  'casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
  'www.casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host')?.replace(/:\d+$/, '') ?? ''

  // ── Domínio customizado: rewrite pra dentro do projeto especial ──
  const basePath = DOMAIN_MAP[host]
  if (basePath && !pathname.startsWith(basePath) && !pathname.startsWith('/app') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    const dest = new URL(`${basePath}${pathname === '/' ? '' : pathname}${search}`, request.url)
    return NextResponse.rewrite(dest)
  }

  // ── Auth: protege /app e /admin ──────────────────────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/admin') || path.startsWith('/app')

  // Sem sessão tentando entrar em área protegida → manda pro login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Com sessão tentando /admin sem ser super-admin → devolve pro /app
  if (path.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_super_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
