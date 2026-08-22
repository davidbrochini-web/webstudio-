import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import dentistaJoaoSitemap from '@/app/projetos-especiais/dentista-joao/sitemap'
import casosEsquecidosSitemap from '@/app/projetos-especiais/casos-esquecidos/sitemap'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'
import { niches } from '@/lib/templates'
import { SEO_NICHOS } from '@/lib/seo-nichos'

const BASE_URL = 'https://omnidesign.com.br'

// Domínios customizados de Projetos Especiais apontam pra essa mesma
// app Vercel — sem isso, /sitemap.xml em qualquer domínio devolveria
// sempre o sitemap da plataforma (Omnidesign), nunca o do projeto.
const DOMAIN_SITEMAPS: Record<string, () => Promise<MetadataRoute.Sitemap>> = {
  'drjoaobucomaxilofacial.com.br': dentistaJoaoSitemap,
  'www.drjoaobucomaxilofacial.com.br': dentistaJoaoSitemap,
  'casosesquecidos.com.br': casosEsquecidosSitemap,
  'www.casosesquecidos.com.br': casosEsquecidosSitemap,
}

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get('host')?.replace(/:\d+$/, '') ?? ''
  const custom = DOMAIN_SITEMAPS[host]
  if (custom) return custom()

  const posts = await listarPostsPublicados()

  return [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Landing pages por nicho — antes eram noindex (vitrine de demo
    // pura, conteúdo quase-duplicado). Agora cada uma tem H1, intro e
    // FAQ próprios mirando "site para [nicho]" (ver lib/seo-nichos.ts),
    // então entram no sitemap. Só entram os nichos que têm conteúdo de
    // SEO dedicado — nicho sem entrada em SEO_NICHOS continua noindex
    // e fora daqui.
    ...niches
      .filter(n => SEO_NICHOS[n.slug])
      .map(n => ({
        url: `${BASE_URL}/modelos/${n.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ...posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
