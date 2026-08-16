import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import WhatsAppFloat from '@/components/layout/WhatsAppFloat'

export const metadata: Metadata = {
  metadataBase: new URL('https://omnidesign.com.br'),
  // Verificação do Google Search Console — ativa quando a env
  // NEXT_PUBLIC_GSC_VERIFICATION for setada na Vercel (só o token,
  // sem a tag inteira). Nota: a meta tag aparece em todos os domínios
  // servidos por este layout, mas isso é inofensivo — o token só
  // verifica propriedade de omnidesign.com.br no GSC.
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        {children}
        <WhatsAppFloat />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  )
}
