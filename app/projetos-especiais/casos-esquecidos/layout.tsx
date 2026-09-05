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
    keywords: [
      'contos de terror', 'histórias de terror', 'terror psicológico', 'contos de terror grátis',
      'lendas urbanas', 'investigação paranormal', 'D. Broch', 'livro de terror brasileiro',
    ],
    // Verificação do Google Search Console — mesmo padrão do GA4: um
    // token por domínio, nunca o global da Omnidesign.
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CASOS_ESQUECIDOS
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION_CASOS_ESQUECIDOS }
      : undefined,
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

export default async function Layout({ children }: { children: React.ReactNode }) {
  const site = await getSiteEspecial()
  const t = site.textos_customizados ?? {}

  // Paleta customizável (aba Cores no painel) — mesmo mecanismo do
  // dentista-joao/colegio-elite (CSS vars sobrescritas por inline
  // style), só que guardada em textos_customizados em vez de colunas
  // dedicadas: a paleta gótica daqui tem ~10 tokens (não um par
  // primária/secundária), e textos_customizados já existe pra isso —
  // sem migration nova. Defaults = os mesmos hex fixos que já
  // existiam no :root do ce-styles.css.
  const paletaStyle: React.CSSProperties = {
    '--bg': t.paleta_bg || '#0b0a08',
    '--bg-panel': t.paleta_bg_panel || '#15120e',
    '--bg-panel-2': t.paleta_bg_panel_2 || '#1c1812',
    '--line': t.paleta_line || '#322c22',
    '--gold': t.paleta_gold || '#cdb077',
    '--gold-dim': t.paleta_gold_dim || '#8f7c54',
    '--blood': t.paleta_blood || '#9c2b2b',
    '--blood-bright': t.paleta_blood_bright || '#c43a3a',
    '--paper': t.paleta_paper || '#e8dfc8',
    '--paper-dim': t.paleta_paper_dim || '#b7ad94',
    '--muted': t.paleta_muted || '#6f6858',
  } as React.CSSProperties

  return (
    <div className={`ce-site ${cinzel.variable} ${garamond.variable} ${mono.variable}`} style={paletaStyle}>
      {children}
    </div>
  )
}
