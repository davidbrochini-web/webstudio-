import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import IdentidadeCasosForm from '@/components/app/IdentidadeCasosForm'

export default async function CasosEditorPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, business_name, tagline, seo_indexavel')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Editor do Site</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Editor do Site</h1>
      <p className="text-[var(--muted)] text-sm mb-8">Identidade e visibilidade — o resto (contos) fica na aba Casos.</p>

      <IdentidadeCasosForm
        siteId={site.id}
        businessName={site.business_name}
        tagline={site.tagline}
        seoIndexavel={site.seo_indexavel}
        readOnly={!podeEditar}
      />
    </div>
  )
}
