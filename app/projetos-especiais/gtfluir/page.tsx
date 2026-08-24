import type { Metadata } from 'next'
import GtFluirClient from './GtFluirClient'

export const metadata: Metadata = {
  title: { absolute: 'GT Fluir Pilates — exemplo de site | Omnidesign' },
  robots: { index: false, follow: false },
}

export default function GtFluirExemplo() {
  return <GtFluirClient />
}
