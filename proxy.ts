import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DOMAIN_MAP } from '@/lib/domain-map'

// Domínios customizados dos Projetos Especiais → rewrite transparente
// pra dentro do path real do site na app Next.js. Usa rewrite (não
// redirect) pra manter a URL limpa no browser do paciente.
// Mapeamento em lib/domain-map.ts (fonte única, reaproveitada pelos
// componentes que geram links — ver lib/dentista-joao.ts getBasePath()).

// Projetos especiais que NÃO têm login próprio (usam o /login global da
// plataforma de propósito — ver PROJETO_ESPECIAL_CASOS_ESQUECIDOS.md,
// seção 9: "quem administra aqui é o próprio David/D. Broch, não um
// cliente leigo"). Sem essa exceção, o rewrite pega o /login também e
// manda pra .../login dentro do projeto, que não existe → 404 (bug real
// encontrado em revisão: toda página prefetchava /login e dava 404 no
// domínio próprio do Casos Esquecidos). Dentista João tem login próprio
// (/projetos-especiais/dentista-joao/login existe de verdade), por isso
// não entra nessa lista — o rewrite deve continuar pegando o /login dele.
const SEM_LOGIN_PROPRIO = new Set(['/projetos-especiais/casos-esquecidos'])

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host')?.replace(/:\d+$/, '') ?? ''

  // ── Domínio customizado: rewrite pra dentro do projeto especial ──
  const basePath = DOMAIN_MAP[host]
  const ehLoginSemDono = pathname === '/login' && basePath && SEM_LOGIN_PROPRIO.has(basePath)
  if (basePath && !ehLoginSemDono && !pathname.startsWith(basePath) && !pathname.startsWith('/app') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
    const dest = new URL(`${basePath}${pathname === '/' ? '' : pathname}${search}`, request.url)
    return NextResponse.rewrite(dest)
  }

  // ── Rotas protegidas: só /admin, /app e /primeiro-acesso precisam
  //    de sessão. Todo o resto (home, /blog, /modelos, projetos
  //    especiais) é público — sair daqui ANTES de criar o client
  //    Supabase evita uma chamada de rede pro Auth em toda visita a
  //    página pública, que estava deixando até a home mais lenta à
  //    toa (achado real: /blog media 3-4s numa visita "fria" antes
  //    desse fix).
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/admin') || path.startsWith('/app') || path === '/primeiro-acesso'
  if (!isProtected) {
    return NextResponse.next({ request })
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

  // Sem sessão tentando entrar em área protegida → manda pro login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Sessão ativa com must_change_password=true → trava em /primeiro-acesso
  // até trocar a senha (e opcionalmente subir foto). Pedido do David:
  // contas criadas pra outras pessoas da equipe (ex: Eliane) não podem
  // seguir usando a senha provisória que ele definiu na criação.
  if (isProtected && user && path !== '/primeiro-acesso') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('must_change_password')
      .eq('id', user.id)
      .single()

    if (profile?.must_change_password) {
      const url = request.nextUrl.clone()
      url.pathname = '/primeiro-acesso'
      return NextResponse.redirect(url)
    }
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
