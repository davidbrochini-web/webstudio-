import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'
import { DOMAIN_MAP } from '@/lib/domain-map'

export const metadata: Metadata = {
  metadataBase: new URL('https://omnidesign.com.br'),
  // Verificação do Google Search Console — ativa quando a env
  // NEXT_PUBLIC_GSC_VERIFICATION for setada na Vercel (só o token,
  // sem a tag inteira). Essa é SÓ a do domínio da própria Omnidesign.
  // Cada Projeto Especial com domínio próprio tem seu próprio token
  // no generateMetadata do layout dele (mesmo padrão do GA4 em
  // GoogleAnalytics.tsx) — nunca reaproveitar este aqui pra outro
  // domínio, o Google não conseguiria confirmar a propriedade certa.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
  title: {
    default: 'Omnidesign — Sites Inteligentes Conectados ao Instagram + Sistemas Internos',
    template: '%s | Omnidesign',
  },
  description:
    'Sites profissionais conectados ao Instagram e sistemas internos sob medida para pequenos e médios negócios. Automação, organização e presença digital em um só lugar.',
  keywords: [
    'criação de site', 'site para pequena empresa', 'site conectado ao instagram',
    'sistema interno para empresa', 'site institucional', 'CRM para pequena empresa',
    'agência de marketing digital', 'gestão de google ads para pequena empresa',
    'google meu negócio', 'chatgpt ads',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    title: 'Omnidesign — Sites Inteligentes Conectados ao Instagram',
    description: 'Sites que se atualizam sozinhos e sistemas internos que organizam sua empresa. Tudo automatizado, sem trabalho extra.',
    type: 'website',
    url: 'https://omnidesign.com.br',
    siteName: 'Omnidesign',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnidesign — Sites Inteligentes Conectados ao Instagram',
    description: 'Sites que se atualizam sozinhos e sistemas internos que organizam sua empresa.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060606',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // WhatsAppFloat exclui rotas /projetos-especiais via usePathname() —
  // mas isso só funciona no domínio .vercel.app, onde o path REAL
  // contém esse prefixo. Em domínio customizado (drjoaovictorpimenta.
  // com.br, casosesquecidos.com.br etc.) o proxy.ts reescreve o path
  // internamente e o visitante/usePathname() nunca vê "/projetos-
  // especiais" — a exclusão por path silenciosamente falhava, e o
  // botão flutuante da PRÓPRIA Omnidesign (número da agência) aparecia
  // no site do cliente. Fix: checar pelo HOST aqui no server (onde dá
  // pra ler o header de verdade, sem depender do path reescrito).
  const host = (await headers()).get('host')?.split(':')[0] ?? ''
  const dominioDeProjetoEspecial = host in DOMAIN_MAP

  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
        <WhatsAppFloat ocultarPorDominio={dominioDeProjetoEspecial} />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  )
}
