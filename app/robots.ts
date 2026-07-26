import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/app', '/login'],
    },
    sitemap: 'https://omnidesign.com.br/sitemap.xml',
  }
}
