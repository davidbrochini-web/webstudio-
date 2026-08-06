import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_SLUG, SITE_URL_BASE } from '@/lib/dentista-joao'
// Dinâmico de propósito: consulta ao banco a cada request pra refletir
// o toggle de indexação e de visibilidade por seção na hora.
export const dynamic = 'force-dynamic'

/**
 * Sitemap dedicado do projeto especial (servido em
 * /projetos-especiais/dentista-joao/sitemap.xml — no domínio próprio,
 * o app/sitemap.ts global detecta o host e delega pra cá). Enquanto o
 * site está noindex (sites.seo_indexavel=false, toggle na aba SEO do
 * painel) emite vazio de propósito — não faz sentido anunciar URL que
 * o robots meta manda não indexar. Seções marcadas como ocultas
 * (VisibilidadeSecaoToggle) também não entram — a página mostra "Em
 * breve" e não tem por que o Google gastar crawl budget nisso.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, seo_indexavel, secao_tratamentos_visivel, secao_cursos_visivel, secao_equipe_visivel, secao_faq_visivel, secao_artigos_visivel')
    .eq('slug', SITE_SLUG).is('deleted_at', null).single()
  if (!site || !site.seo_indexavel) return []

  const [{ data: tratamentos }, { data: artigos }, { data: cursos }] = await Promise.all([
    site.secao_tratamentos_visivel
      ? supabase.from('site_tratamentos').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
    site.secao_artigos_visivel
      ? supabase.from('site_blog_posts').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
    site.secao_cursos_visivel
      ? supabase.from('site_cursos_eventos').select('slug, updated_at').eq('site_id', site.id).eq('publicado', true).is('deleted_at', null)
      : Promise.resolve({ data: [] }),
  ])

  const paginasCondicionais: { slug: string; visivel: boolean }[] = [
    { slug: 'tratamentos', visivel: site.secao_tratamentos_visivel },
    { slug: 'cursos-e-eventos', visivel: site.secao_cursos_visivel },
    { slug: 'equipe', visivel: site.secao_equipe_visivel },
    { slug: 'duvidas-frequentes', visivel: site.secao_faq_visivel },
    { slug: 'artigos', visivel: site.secao_artigos_visivel },
  ]

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL_BASE, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/a-clinica`, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL_BASE}/contato`, priority: 0.8, changeFrequency: 'monthly' },
    ...paginasCondicionais
      .filter(p => p.visivel)
      .map(p => ({ url: `${SITE_URL_BASE}/${p.slug}`, priority: 0.8, changeFrequency: 'monthly' as const })),
  ]

  const dinamicas: MetadataRoute.Sitemap = [
    ...(tratamentos ?? []).map(t => ({ url: `${SITE_URL_BASE}/tratamentos/${t.slug}`, lastModified: t.updated_at, priority: 0.7 })),
    ...(artigos ?? []).map(a => ({ url: `${SITE_URL_BASE}/artigos/${a.slug}`, lastModified: a.updated_at, priority: 0.6 })),
    ...(cursos ?? []).map(c => ({ url: `${SITE_URL_BASE}/cursos-e-eventos/${c.slug}`, lastModified: c.updated_at, priority: 0.6 })),
  ]

  return [...estaticas, ...dinamicas]
}
