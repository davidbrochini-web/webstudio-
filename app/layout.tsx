import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'

export const metadata: Metadata = {
  metadataBase: new URL('https://omnidesign.com.br'),
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
      <body className="antialiased">{children}</body>
    </html>
  )
}
