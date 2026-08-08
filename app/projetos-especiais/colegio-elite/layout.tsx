import type { Metadata } from 'next'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/colegio-elite'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    metadataBase: new URL(SITE_URL_BASE),
    title: {
      default: site.business_name,
      template: `%s — ${site.business_name}`,
    },
    description: site.tagline ?? undefined,
    robots: { index: site.seo_indexavel, follow: site.seo_indexavel },
    alternates: { canonical: SITE_URL_BASE },
    openGraph: {
      siteName: site.business_name,
      type: 'website',
      locale: 'pt_BR',
      url: SITE_URL_BASE,
      ...(site.hero_imagem_url ? { images: [site.hero_imagem_url] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: site.business_name,
      ...(site.tagline ? { description: site.tagline } : {}),
      ...(site.hero_imagem_url ? { images: [site.hero_imagem_url] } : {}),
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
