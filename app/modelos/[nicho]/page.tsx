import { niches, getNiche } from '@/lib/templates'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ClinicoLayout from '@/components/layouts/ClinicoLayout'
import EditorialLayout from '@/components/layouts/EditorialLayout'
import PortfolioLayout from '@/components/layouts/PortfolioLayout'
import UrbanoLayout from '@/components/layouts/UrbanoLayout'
import PerformanceLayout from '@/components/layouts/PerformanceLayout'
import ZenLayout from '@/components/layouts/ZenLayout'
import AcolhedorLayout from '@/components/layouts/AcolhedorLayout'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export function generateStaticParams() {
  return niches.map(n => ({ nicho: n.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ nicho: string }> }
): Promise<Metadata> {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) return {}
  return {
    title: `${config.label} — modelo de site | webstudio`,
    description: config.heroSub,
    robots: { index: false },
  }
}

const layoutByArchetype = {
  clinico: ClinicoLayout,
  editorial: EditorialLayout,
  portfolio: PortfolioLayout,
  urbano: UrbanoLayout,
  performance: PerformanceLayout,
  zen: ZenLayout,
  acolhedor: AcolhedorLayout,
}

export default async function NichePreview(
  { params }: { params: Promise<{ nicho: string }> }
) {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) notFound()

  const LayoutComponent = layoutByArchetype[config.pageLayout]

  return (
    <div className="min-h-screen">
      {/* Barra de preview da agência — única coisa compartilhada entre os 7 arquétipos */}
      <div className="sticky top-0 z-50 bg-black text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold grad-text flex-shrink-0">webstudio</span>
          <span className="text-xs text-white/50 truncate">
            — modelo: {config.label}. Esse site pode ser seu.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/#templates" className="text-xs font-medium text-white/60 hover:text-white transition-colors px-2 py-1">
            ← Voltar
          </Link>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold bg-[#25D366] hover:bg-[#22c55e] transition-colors px-3 py-1.5 rounded-lg"
          >
            Quero esse site
          </a>
        </div>
      </div>

      {/* Página do nicho — estrutura, ordem de seções e componentes totalmente próprios */}
      <LayoutComponent config={config} />
    </div>
  )
}
