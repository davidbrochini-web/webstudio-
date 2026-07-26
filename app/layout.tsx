import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'

export const metadata: Metadata = {
  title: 'Omnidesign — Sistemas Web Inteligentes · Automação · Cloud',
  description:
    'Sites profissionais conectados ao Instagram e sistemas internos sob medida para pequenos e médios negócios. Automação, organização e presença digital em um só lugar.',
  openGraph: {
    title: 'Omnidesign — Sistemas Web Inteligentes',
    description: 'Sites que se atualizam sozinhos e sistemas internos que organizam sua empresa. Tudo automatizado, sem trabalho extra.',
    type: 'website',
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
