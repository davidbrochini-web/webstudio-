import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_SLUG, SITE_URL_BASE } from '@/lib/colegio-elite'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, seo_indexavel, secao_diferenciais_visivel, secao_segmentos_visivel, secao_faq_visivel, secao_artigos_visivel')
    .eq('slug', SITE_SLUG).is('deleted_at', null).single()
  if (!site || !site.seo_indexavel) return []

  const [{ data: segmentos }, { data: artigos }] = await Promise.all([
    site.secao_segmentos_visivel
      ? supabase.from('site_segmentos_ensino').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
    site.secao_artigos_visivel
      ? supabase.from('site_blog_posts').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
  ])

  const paginasCondicionais: { slug: string; visivel: boolean }[] = [
    { slug: 'ensino', visivel: site.secao_segmentos_visivel },
    { slug: 'estrutura', visivel: site.secao_diferenciais_visivel },
    { slug: 'noticias', visivel: site.secao_artigos_visivel },
  ]

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL_BASE, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/proposta-pedagogica`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL_BASE}/localizacao`, priority: 0.6, changeFrequency: 'yearly' },
    { url: `${SITE_URL_BASE}/contato`, priority: 0.8, changeFrequency: 'monthly' },
    ...paginasCondicionais
      .filter(p => p.visivel)
      .map(p => ({ url: `${SITE_URL_BASE}/${p.slug}`, priority: 0.8, changeFrequency: 'monthly' as const })),
  ]

  const dinamicas: MetadataRoute.Sitemap = [
    ...(segmentos ?? []).map(s => ({ url: `${SITE_URL_BASE}/ensino/${s.slug}`, lastModified: s.updated_at, priority: 0.7 })),
    ...(artigos ?? []).map(a => ({ url: `${SITE_URL_BASE}/noticias/${a.slug}`, lastModified: a.updated_at, priority: 0.6 })),
  ]

  return [...estaticas, ...dinamicas]
}
