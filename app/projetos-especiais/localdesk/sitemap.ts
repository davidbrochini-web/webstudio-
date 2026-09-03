import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_SLUG, SITE_URL_BASE } from '@/lib/localdesk'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('seo_indexavel')
    .eq('slug', SITE_SLUG).is('deleted_at', null).single()
  if (!site || !site.seo_indexavel) return []

  return [
    { url: SITE_URL_BASE, priority: 1, changeFrequency: 'weekly' },
    { url: `${SITE_URL_BASE}/servicos`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL_BASE}/sobre`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE_URL_BASE}/contato`, priority: 0.8, changeFrequency: 'monthly' },
  ]
}
