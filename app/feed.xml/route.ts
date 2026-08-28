import { headers } from 'next/headers'
import { GET as casosEsquecidosFeed } from '@/app/projetos-especiais/casos-esquecidos/feed.xml/route'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'

// Mesmo problema do sitemap.xml/robots.txt (ver PROJETO_ESPECIAL_DENTISTA_JOAO.md
// seção 2): paths com "." são excluídos do rewrite em proxy.ts, então
// /feed.xml no domínio customizado caía direto aqui (na raiz da
// plataforma) sem essa delegação. Cada projeto especial futuro com feed RSS
// próprio precisa de uma entrada aqui.
const DOMAIN_FEEDS: Record<string, () => Promise<Response>> = {
  'casosesquecidos.com.br': casosEsquecidosFeed,
  'www.casosesquecidos.com.br': casosEsquecidosFeed,
}

const BASE_URL = 'https://omnidesign.com.br'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** RSS do blog da Omnidesign — servido quando o host é a própria
 *  plataforma (omnidesign.com.br). Antes essa rota devolvia 404 pra
 *  qualquer host fora do mapa de projetos especiais, o que fazia
 *  sentido enquanto a plataforma não tinha blog com conteúdo — agora
 *  tem (16+ posts), e feed RSS ajuda descoberta por agregadores e
 *  ferramentas de IA. */
async function omnidesignFeed(): Promise<Response> {
  const posts = await listarPostsPublicados()

  const items = posts.map(p => {
    const url = `${BASE_URL}/blog/${p.slug}`
    const pubDate = p.publicado_em ? new Date(p.publicado_em).toUTCString() : new Date(p.updated_at).toUTCString()
    return `
    <item>
      <title>${escapeXml(p.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.resumo)}</description>
      <pubDate>${pubDate}</pubDate>
      ${p.categoria ? `<category>${escapeXml(p.categoria)}</category>` : ''}
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog da Omnidesign — Sites e Sistemas para Pequenas Empresas</title>
    <link>${BASE_URL}/blog</link>
    <description>Como site, sistema interno e presença no Google resolvem o que trava um negócio pequeno ou médio no dia a dia.</description>
    <language>pt-BR</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}

export async function GET() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const handler = DOMAIN_FEEDS[host]
  if (handler) return handler()

  // Só hosts da PRÓPRIA plataforma recebem o feed da Omnidesign —
  // domínio customizado de Projeto Especial sem feed próprio (ex:
  // drjoaovictorpimenta.com.br) continua 404, senão a marca da
  // Omnidesign vazaria pra dentro do site do cliente.
  const isPlatformHost =
    host === 'omnidesign.com.br' ||
    host === 'www.omnidesign.com.br' ||
    host.endsWith('.vercel.app')
  if (isPlatformHost) return omnidesignFeed()

  return new Response('Not found', { status: 404 })
}
