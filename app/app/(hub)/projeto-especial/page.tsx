import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'

export default async function ProjetoEspecialHome() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()

  // Contadores pra mostrar no dashboard
  const [{ count: totalLeads }, { count: leadsHoje }, { count: totalArtigos }, { count: totalTratamentos }] =
    await Promise.all([
      supabase.from('site_leads').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId),
      supabase.from('site_leads').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId)
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
      supabase.from('site_blog_posts').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).is('deleted_at', null).eq('publicado', true),
      supabase.from('site_tratamentos').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).is('deleted_at', null),
    ])

  return (
    <div className="max-w-4xl">
      {/* Boas-vindas */}
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">
          Painel do Site
        </h1>
        <p className="text-[var(--muted)] text-sm">
          Edite o conteúdo, publique artigos e acompanhe os contatos recebidos.
        </p>
      </div>

      {/* Destaque: Leads */}
      <Link
        href="/app/projeto-especial/leads"
        className="group flex items-center justify-between bg-[#0B2B3C] rounded-2xl px-7 py-6 mb-6 hover:bg-[#0d3347] transition-colors shadow-lg"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
            📥
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">Leads recebidos</p>
            <p className="text-white/60 text-sm mt-0.5">Acompanhe os contatos e pedidos de consulta do site</p>
          </div>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0">
          {leadsHoje ? (
            <div className="text-center hidden sm:block">
              <p className="font-display font-extrabold text-[#0EA5A0] text-2xl">{leadsHoje}</p>
              <p className="text-white/50 text-xs">hoje</p>
            </div>
          ) : null}
          <div className="text-center">
            <p className="font-display font-extrabold text-white text-2xl">{totalLeads ?? 0}</p>
            <p className="text-white/50 text-xs">total</p>
          </div>
          <span className="text-white/40 group-hover:text-white/70 transition-colors text-xl">→</span>
        </div>
      </Link>

      {/* Editor + Blog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/app/projeto-especial/editor"
          className="group bg-[var(--card-bg)] border-2 border-[#0EA5A0]/30 hover:border-[#0EA5A0] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0EA5A0]/10 flex items-center justify-center text-xl mb-5">
            🎨
          </div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Editor do Site</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Edite textos, imagens e informações de cada seção do site — home, tratamentos, equipe, FAQ e mais.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0EA5A0]">{totalTratamentos ?? 0} tratamentos</span>
            <span className="text-[var(--border)]">·</span>
            <span className="text-xs text-[var(--muted)] group-hover:text-[#0EA5A0] transition-colors font-semibold">Editar →</span>
          </div>
        </Link>

        <Link
          href="/app/projeto-especial/blog"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-xl mb-5">
            ✍️
          </div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Blog / Artigos</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Publique artigos, dicas e novidades da clínica. Cada publicação aparece na seção de novidades do site.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--brand)]">{totalArtigos ?? 0} publicados</span>
            <span className="text-[var(--border)]">·</span>
            <span className="text-xs text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors font-semibold">Escrever →</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
