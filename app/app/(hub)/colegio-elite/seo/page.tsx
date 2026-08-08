import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import SeoIndexToggle from '@/components/colegio-elite-editor/SeoIndexToggle'

export default async function SeoPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase.from('sites').select('id, seo_indexavel').eq('id', info.siteId).single()
  if (!site) return null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/colegio-elite" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">SEO</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">SEO</h1>
      <p className="text-[var(--muted)] text-sm mb-8">Controle se o site já pode aparecer nas buscas do Google.</p>

      <SeoIndexToggle siteId={site.id} indexavel={site.seo_indexavel} />
    </div>
  )
}
