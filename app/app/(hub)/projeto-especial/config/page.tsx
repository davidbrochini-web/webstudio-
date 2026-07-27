import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import ProjetoEspecialSubNav from '@/components/app/ProjetoEspecialSubNav'
import ConfigForm from '@/components/app/ConfigForm'

export default async function ConfigPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return <p className="text-sm text-[var(--muted)]">Site não encontrado pra esse tenant.</p>

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, business_name, tagline, hero_title, hero_sub, hero_imagem_url, telefone, whatsapp, instagram_handle, endereco, status')
    .eq('id', info.siteId)
    .single()

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Site</h1>
      <ProjetoEspecialSubNav />
      {site && <ConfigForm site={site} readOnly={!podeEditar} />}
    </div>
  )
}
