import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import PaletaCasosEditor from '@/components/app/PaletaCasosEditor'

export default async function CasosCoresPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('textos_customizados')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Cores</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Paleta do Site</h1>

      <PaletaCasosEditor
        siteId={info.siteId}
        valoresIniciais={site.textos_customizados ?? {}}
        readOnly={!podeEditar}
      />
    </div>
  )
}
