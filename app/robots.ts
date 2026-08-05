import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { SITE_INDEXAVEL as DJ_INDEXAVEL, SITE_URL_BASE as DJ_URL_BASE } from '@/lib/dentista-joao'

const DOMAIN_ROBOTS: Record<string, () => MetadataRoute.Robots> = {
  'drjoaobucomaxilofacial.com.br': () => ({
    rules: {
      userAgent: '*',
      allow: DJ_INDEXAVEL ? '/' : undefined,
      disallow: DJ_INDEXAVEL ? ['/app', '/login', '/meus-agendamentos'] : '/',
    },
    sitemap: `${DJ_URL_BASE}/sitemap.xml`,
  }),
}
DOMAIN_ROBOTS['www.drjoaobucomaxilofacial.com.br'] = DOMAIN_ROBOTS['drjoaobucomaxilofacial.com.br']

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
