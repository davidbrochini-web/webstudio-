import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import EditorShell from '@/components/app/EditorShell'
import ConfigForm from '@/components/app/ConfigForm'

export default async function EditorHomePage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, telefone, whatsapp, instagram_handle, endereco, status')
    .eq('id', info.siteId)
    .single()

  if (!site) return null
  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <EditorShell
      icon="🏠"
      label="Home"
      desc="Título de destaque, foto principal e texto que aparece assim que alguém entra no site."
      cor="#0B2B3C"
      onde="Home → Banner principal e seção Bem-vindo"
    >
      <ConfigForm site={site} readOnly={!podeEditar} redirectTo="/app/projeto-especial/editor/home" />
    </EditorShell>
  )
}
