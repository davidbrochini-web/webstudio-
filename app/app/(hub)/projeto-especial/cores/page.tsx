import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import CoresEditor from '@/components/dentista-joao-editor/CoresEditor'

export default async function CoresPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('cor_primaria, cor_secundaria')
    .eq('id', info.siteId).single()

  if (!site) return null
  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Cores</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Cores do Site</h1>

      <CoresEditor
        siteId={info.siteId}
        corPrimariaInicial={site.cor_primaria}
        corSecundariaInicial={site.cor_secundaria}
        readOnly={!podeEditar}
      />
    </div>
  )
}
