import { getSiteEspecial, getAllContos, imagemAbsoluta, SITE_URL_BASE } from '@/lib/casos-esquecidos'

export const dynamic = 'force-dynamic'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const site = await getSiteEspecial()
  const contos = await getAllContos(site.id)
  const ordenados = [...contos].sort((a, b) => b.numero - a.numero)

  const items = ordenados.map(c => {
    const url = `${SITE_URL_BASE}/contos/${c.slug}`
    const pubDate = new Date(c.created_at).toUTCString()
    return `
    <item>
      <title>${escapeXml(c.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(c.resumo)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>D. Broch</author>
      ${c.imagem_url ? `<enclosure url="${imagemAbsoluta(c.imagem_url)}" type="image/jpeg" />` : ''}
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Casos Esquecidos — Contos de Terror por D. Broch</title>
    <link>${SITE_URL_BASE}</link>
    <description>Contos de terror gratuitos publicados toda semana por D. Broch.</description>
    <language>pt-BR</language>
    <atom:link href="${SITE_URL_BASE}/feed.xml" rel="self" type="application/rss+xml" />
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
