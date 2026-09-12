import type { Metadata } from 'next'
import MapaAstralClient from './MapaAstralClient'

export const metadata: Metadata = {
  title: { absolute: 'Mapa Astral' },
  description: 'Descubra o que os astros revelam sobre você.',
  robots: { index: false, follow: false },
  viewport: 'width=device-width, initial-scale=1',
}

export default function AppAstrologiaPage() {
  return <MapaAstralClient />
}
