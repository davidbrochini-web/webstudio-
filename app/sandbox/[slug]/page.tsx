import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSiteConfigBySlug } from '@/lib/site-content'
import { layoutByArchetype } from '@/lib/layout-map'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) return {}
  return {
    title: result.config.businessName,
    description: result.config.heroSub,
    robots: { index: result.site.status === 'publicado' ? true : false },
  }
}

export default async function SandboxSite(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const result = await getSiteConfigBySlug(slug)
  if (!result) notFound()

  const { site, config } = result
  const LayoutComponent = layoutByArchetype[config.pageLayout]

  return (
    <div className="min-h-screen">
      {site.status === 'rascunho' && (
        <div className="bg-amber-500 text-white text-center text-xs font-semibold py-1.5 px-4">
          Rascunho — visível só pra você e pra equipe Omnidesign. Publique quando estiver pronto.
        </div>
      )}
      <LayoutComponent config={config} />
      <div className="text-center text-[11px] text-[var(--muted)] py-4 border-t border-[var(--border)]">
        Site em demonstração — feito por{' '}
        <span className="font-semibold text-[var(--brand)]">omnidesign</span>
      </div>
    </div>
  )
}
