import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_INDEXAVEL, SITE_SLUG, SITE_URL_BASE } from '@/lib/dentista-joao'
// Dinâmico de propósito: quando SITE_INDEXAVEL virar true, a consulta ao
// banco usa o client com cookies — em prerender estático isso quebra o build.
export const dynamic = 'force-dynamic'


/**
 * Sitemap dedicado do projeto especial (servido em
 * /projetos-especiais/dentista-joao/sitemap.xml). Enquanto o site está
 * noindex (SITE_INDEXAVEL=false) ele emite vazio de propósito — não faz
 * sentido anunciar URL que o robots meta manda não indexar. Ao flipar a
 * flag, as rotas estáticas + slugs publicados entram sozinhos.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_INDEXAVEL) return []

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites').select('id').eq('slug', SITE_SLUG).is('deleted_at', null).single()
  if (!site) return []

  const [{ data: tratamentos }, { data: artigos }, { data: cursos }] = await Promise.all([
    supabase.from('site_tratamentos').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null),
    supabase.from('site_blog_posts').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null),
    supabase.from('site_cursos_eventos').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null),
  ])

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL_BASE, priority: 1, changeFrequency: 'weekly' },
    ...['a-clinica', 'tratamentos', 'cursos-e-eventos', 'equipe', 'duvidas-frequentes', 'artigos', 'contato']
      .map(p => ({ url: `${SITE_URL_BASE}/${p}`, priority: 0.8, changeFrequency: 'monthly' as const })),
  ]

  const dinamicas: MetadataRoute.Sitemap = [
    ...(tratamentos ?? []).map(t => ({ url: `${SITE_URL_BASE}/tratamentos/${t.slug}`, lastModified: t.updated_at, priority: 0.7 })),
    ...(artigos ?? []).map(a => ({ url: `${SITE_URL_BASE}/artigos/${a.slug}`, lastModified: a.updated_at, priority: 0.6 })),
    ...(cursos ?? []).map(c => ({ url: `${SITE_URL_BASE}/cursos-e-eventos/${c.slug}`, lastModified: c.updated_at, priority: 0.6 })),
  ]

  return [...estaticas, ...dinamicas]
}
