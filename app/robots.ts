import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SITE_SLUG as DJ_SLUG, SITE_URL_BASE as DJ_URL_BASE } from '@/lib/dentista-joao'

async function dentistaJoaoRobots(): Promise<MetadataRoute.Robots> {
  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites').select('seo_indexavel').eq('slug', DJ_SLUG).is('deleted_at', null).single()
  const indexavel = site?.seo_indexavel ?? false
  return {
    rules: {
      userAgent: '*',
      allow: indexavel ? '/' : undefined,
      disallow: indexavel ? ['/app', '/login', '/meus-agendamentos'] : '/',
    },
    sitemap: `${DJ_URL_BASE}/sitemap.xml`,
  }
}

const DOMAIN_ROBOTS: Record<string, () => Promise<MetadataRoute.Robots>> = {
  'drjoaobucomaxilofacial.com.br': dentistaJoaoRobots,
  'www.drjoaobucomaxilofacial.com.br': dentistaJoaoRobots,
}

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')?.replace(/:\d+$/, '') ?? ''
  const custom = DOMAIN_ROBOTS[host]
  if (custom) return custom()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/app', '/login', '/demo/iniciar'],
    },
    sitemap: 'https://omnidesign.com.br/sitemap.xml',
  }
}
