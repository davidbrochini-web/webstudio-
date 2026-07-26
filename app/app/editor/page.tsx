import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClinicoLiveEditor from '@/components/site-editor/ClinicoLiveEditor'
import EditorialLiveEditor from '@/components/site-editor/EditorialLiveEditor'
import PortfolioLiveEditor from '@/components/site-editor/PortfolioLiveEditor'
import UrbanoLiveEditor from '@/components/site-editor/UrbanoLiveEditor'
import PerformanceLiveEditor from '@/components/site-editor/PerformanceLiveEditor'
import ZenLiveEditor from '@/components/site-editor/ZenLiveEditor'
import AcolhedorLiveEditor from '@/components/site-editor/AcolhedorLiveEditor'
import ContactSettingsBar from '@/components/site-editor/ContactSettingsBar'

export default async function SiteLiveEditorPage() {
  const info = await getCurrentTenant()
  if (!info) redirect('/app')
  if (!info.siteId) redirect('/app')

  const supabase = await createClient()
  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, pagelayout, business_name, tagline, hero_title, hero_sub, cta_label, whatsapp, instagram_handle, status, cta_heading, cta_subtext, banner_text')
    .eq('id', info.siteId)
    .single()

  if (!site) redirect('/app')

  const [{ data: servicos }, { data: fotos }, { data: depoimentos }, { data: stats }] = await Promise.all([
    supabase.from('site_servicos').select('id, icon, title, description, preco').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_fotos').select('id, url').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_depoimentos').select('id, nome, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_stats').select('id, valor, rotulo').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
  ])

  const podeEditar = info.papel === 'owner' || info.papel === 'admin'
  const servicosList = servicos ?? []
  const fotosList = fotos ?? []
  const depoimentosList = depoimentos ?? []
  const statsList = stats ?? []

  function renderEditor() {
    switch (site!.pagelayout) {
      case 'clinico':
        return <ClinicoLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimento={depoimentosList[0] ?? null} stats={statsList} readOnly={!podeEditar} />
      case 'editorial':
        return <EditorialLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimento={depoimentosList[0] ?? null} stats={statsList} readOnly={!podeEditar} />
      case 'portfolio':
        return <PortfolioLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimento={depoimentosList[0] ?? null} readOnly={!podeEditar} />
      case 'urbano':
        return <UrbanoLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimento={depoimentosList[0] ?? null} readOnly={!podeEditar} />
      case 'performance':
        return <PerformanceLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimentos={depoimentosList} stats={statsList} readOnly={!podeEditar} />
      case 'zen':
        return <ZenLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimento={depoimentosList[0] ?? null} readOnly={!podeEditar} />
      case 'acolhedor':
        return <AcolhedorLiveEditor site={site!} servicos={servicosList} fotos={fotosList} depoimentos={depoimentosList} readOnly={!podeEditar} />
      default:
        return <p className="p-6 text-sm text-[var(--muted)]">Template não reconhecido.</p>
    }
  }

  return (
    <div className="min-h-screen bg-[var(--off)]">
      {info.isDemo ? (
        <div className="bg-[var(--card-bg)] border-b border-[var(--border)] px-4 sm:px-6 pt-3 pb-2 sticky top-0 z-20">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-[var(--brand)] flex-shrink-0">✨ Demo</span>
            <Link
              href="/app"
              className="text-sm font-bold text-white px-4 py-2 rounded-lg grad-bg hover:opacity-90 hover:scale-105 transition-all whitespace-nowrap shadow-md"
            >
              🧩 Ver como os módulos funcionam
            </Link>
            <a
              href={`/sandbox/${site.slug}`}
              target="_blank"
              className="text-xs font-semibold text-[var(--ink)] px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--off)] transition-colors whitespace-nowrap"
            >
              🚀 Quero ver o site no ar
            </a>
          </div>
          <p className="text-center text-[11px] text-[var(--muted)] mt-2">
            Clique em qualquer texto ou foto do site abaixo pra editar na hora
          </p>
        </div>
      ) : (
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
      )}


      <ContactSettingsBar
        siteId={site.id}
        whatsapp={site.whatsapp}
        instagramHandle={site.instagram_handle}
        readOnly={!podeEditar}
      />

      <div className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
        {renderEditor()}
      </div>
    </div>
  )
}
