import type { Metadata } from 'next'
import { Cinzel, EB_Garamond, JetBrains_Mono } from 'next/font/google'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/casos-esquecidos'
import './ce-styles.css'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cinzel', display: 'optional' })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-garamond', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono-var', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    metadataBase: new URL(SITE_URL_BASE),
    title: { default: 'Casos Esquecidos — Contos e Livros de Terror | D. Broch', template: '%s | Casos Esquecidos' },
    description: 'Contos de terror e histórias de terror gratuitas, publicadas toda semana. Livros de terror de D. Broch — horror psicológico e investigação paranormal.',
    robots: { index: site.seo_indexavel, follow: site.seo_indexavel },
    alternates: {
      canonical: SITE_URL_BASE,
      types: { 'application/rss+xml': `${SITE_URL_BASE}/feed.xml` },
    },
    openGraph: {
      siteName: 'Casos Esquecidos',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Casos Esquecidos — Contos e Livros de Terror | D. Broch',
      description: 'Contos de terror gratuitos toda semana. Terror psicológico e investigação paranormal por D. Broch.',
      images: [`${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ce-site ${cinzel.variable} ${garamond.variable} ${mono.variable}`}>
      {children}
    </div>
  )
}
