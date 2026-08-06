import type { MetadataRoute } from 'next'
import { getSiteEspecial, getAllContos, SITE_URL_BASE } from '@/lib/casos-esquecidos'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteEspecial()
  if (!site.seo_indexavel) return []

  const contos = await getAllContos(site.id)

  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL_BASE, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/contos`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/sobre`, priority: 0.6, changeFrequency: 'monthly' },
  ]

  const temas: MetadataRoute.Sitemap = getAllTemas().map(t => ({
    url: `${SITE_URL_BASE}/contos/tema/${t.slug}`,
    priority: 0.6,
    changeFrequency: 'weekly',
  }))

  const dinamicas: MetadataRoute.Sitemap = contos.map(c => ({
    url: `${SITE_URL_BASE}/contos/${c.slug}`,
    lastModified: c.updated_at,
    priority: 0.7,
  }))

  return [...estaticas, ...temas, ...dinamicas]
}
