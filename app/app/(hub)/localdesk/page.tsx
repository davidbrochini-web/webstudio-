import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import SiteIdentityForm from '@/components/app/SiteIdentityForm'

export default async function LocaldeskIdentityPage() {
  const info = await getCurrentTenant()
  if (!info?.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, business_name, tagline, hero_title, hero_sub, cta_label, whatsapp, instagram_handle, telefone, endereco, missao, visao, valores')
    .eq('id', info.siteId)
    .single()

  if (!site) return null

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return <SiteIdentityForm site={site} readOnly={!podeEditar} extended />
}
