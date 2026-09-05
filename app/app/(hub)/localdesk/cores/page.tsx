import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import LocaldeskCoresEditor from '@/components/app/LocaldeskCoresEditor'

export default async function LocaldeskCoresPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('cor_primaria, cor_secundaria')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <LocaldeskCoresEditor
      siteId={info.siteId}
      corPrimariaInicial={site.cor_primaria}
      corSecundariaInicial={site.cor_secundaria}
      readOnly={!podeEditar}
    />
  )
}
