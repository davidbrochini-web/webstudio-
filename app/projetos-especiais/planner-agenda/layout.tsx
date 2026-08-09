import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google'

// Tipografia própria deste projeto especial (mesmo padrão do casos-esquecidos):
// Fraunces (serif com personalidade de caderno/caligrafia) pro display,
// Manrope pro corpo de texto, JetBrains Mono pras "etiquetas de data"
// (reforça a metáfora de agenda/planner nos rótulos pequenos).
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-pa-mono',
  display: 'swap',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${manrope.variable} ${mono.variable}`}>{children}</div>
}
