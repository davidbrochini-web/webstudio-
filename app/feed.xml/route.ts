import { headers } from 'next/headers'
import { GET as casosEsquecidosFeed } from '@/app/projetos-especiais/casos-esquecidos/feed.xml/route'

// Mesmo problema do sitemap.xml/robots.txt (ver PROJETO_ESPECIAL_DENTISTA_JOAO.md
// seção 2): paths com "." são excluídos do rewrite em proxy.ts, então
// /feed.xml no domínio customizado caía direto aqui (na raiz da
// plataforma) sem essa delegação — 404, já que não existe feed
// genérico da plataforma. Cada projeto especial futuro com feed RSS
// próprio precisa de uma entrada aqui.
const DOMAIN_FEEDS: Record<string, () => Promise<Response>> = {
  'casosesquecidos.com.br': casosEsquecidosFeed,
  'www.casosesquecidos.com.br': casosEsquecidosFeed,
}

export async function GET() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const handler = DOMAIN_FEEDS[host]
  if (handler) return handler()

  return new Response('Not found', { status: 404 })
}
