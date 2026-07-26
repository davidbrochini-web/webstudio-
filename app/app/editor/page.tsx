import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClinicoLiveEditor from '@/components/site-editor/ClinicoLiveEditor'
import ContactSettingsBar from '@/components/site-editor/ContactSettingsBar'

export default async function SiteLiveEditorPage() {
  const info = await getCurrentTenant()
  if (!info) redirect('/app')
  if (!info.siteId) redirect('/app')

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, pagelayout, business_name, tagline, hero_title, hero_sub, cta_label, whatsapp, instagram_handle, status')
    .eq('id', info.siteId)
    .single()

  if (!site) redirect('/app')
  if (site.pagelayout !== 'clinico') redirect('/app/site')

  const [{ data: servicos }, { data: fotos }, { data: depoimentos }] = await Promise.all([
    supabase.from('site_servicos').select('id, icon, title, description').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_fotos').select('id, url').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_depoimentos').select('id, nome, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem').limit(1),
  ])

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <div className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-20">
        <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">← Voltar</Link>
        <p className="text-xs text-[var(--muted)] text-center flex-1">
          Clique em qualquer texto ou foto pra editar direto aqui · status: <strong>{site.status}</strong>
          {!podeEditar && ' · leitura'}
        </p>
        <a
          href={`/sandbox/${site.slug}`}
          target="_blank"
          className="text-xs font-semibold text-[var(--brand)] px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors whitespace-nowrap"
        >
          Abrir site →
        </a>
      </div>

      <ContactSettingsBar
        siteId={site.id}
        whatsapp={site.whatsapp}
        instagramHandle={site.instagram_handle}
        readOnly={!podeEditar}
      />

      <div className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
        <ClinicoLiveEditor
          site={site}
          servicos={servicos ?? []}
          fotos={fotos ?? []}
          depoimento={depoimentos?.[0] ?? null}
          readOnly={!podeEditar}
        />
      </div>
    </div>
  )
}
