import type { MetadataRoute } from 'next'
import { getSiteEspecial, getAllContos, SITE_URL_BASE } from '@/lib/casos-esquecidos'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteEspecial()
  if (!site.seo_indexavel) return []

  const contos = await getAllContos(site.id)

  // lastModified das listagens = data do conto mais recente: é o que
  // realmente muda nelas, e dá ao Google um motivo concreto pra
  // recrawlear a home/arquivo quando sai caso novo.
  const maisRecente = contos.reduce<string | undefined>((acc, c) => {
    const d = c.updated_at || c.data_publicacao || c.created_at
    return !acc || d > acc ? d : acc
  }, undefined)

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL_BASE, lastModified: maisRecente, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/contos`, lastModified: maisRecente, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/livros-de-terror-gratis`, lastModified: maisRecente, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/contos/curtos`, lastModified: maisRecente, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/contos/brasileiros`, lastModified: maisRecente, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/contos/para-dormir`, lastModified: maisRecente, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/creepypasta-brasileira`, lastModified: maisRecente, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/sobre`, priority: 0.6, changeFrequency: 'monthly' },
  ]

  const temas: MetadataRoute.Sitemap = getAllTemas().map(t => ({
    url: `${SITE_URL_BASE}/contos/tema/${t.slug}`,
    lastModified: maisRecente,
    priority: 0.6,
    changeFrequency: 'weekly',
  }))

  const dinamicas: MetadataRoute.Sitemap = contos.map(c => ({
    url: `${SITE_URL_BASE}/contos/${c.slug}`,
    lastModified: c.updated_at || c.data_publicacao || c.created_at,
    priority: 0.7,
  }))

  return [...estaticas, ...temas, ...dinamicas]
}
