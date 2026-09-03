import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/localdesk'
import './ld-styles.css'

const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-plex', display: 'swap' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    metadataBase: new URL(SITE_URL_BASE),
    title: {
      default: `${site.business_name} — Suporte Técnico e Manutenção de Computadores`,
      template: `%s | ${site.business_name}`,
    },
    description: site.tagline ?? undefined,
    robots: { index: site.seo_indexavel, follow: site.seo_indexavel },
    alternates: { canonical: SITE_URL_BASE },
    openGraph: {
      siteName: site.business_name,
      locale: 'pt_BR',
      type: 'website',
      ...(site.hero_imagem_url ? { images: [site.hero_imagem_url] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: site.business_name,
      ...(site.tagline ? { description: site.tagline } : {}),
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ld-site ${plexSans.variable} ${plexMono.variable}`}>
      {children}
    </div>
  )
}
