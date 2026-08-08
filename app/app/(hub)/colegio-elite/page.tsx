import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'

export default async function ColegioEliteHome() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const hoje = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const [{ count: totalLeads }, { count: leadsHoje }, { count: totalArtigos }, { count: totalSegmentos }, { data: siteSeo }] =
    await Promise.all([
      supabase.from('site_leads').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId),
      supabase.from('site_leads').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).gte('created_at', hoje),
      supabase.from('site_blog_posts').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null).eq('publicado', true),
      supabase.from('site_segmentos_ensino').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId).is('deleted_at', null),
      supabase.from('sites').select('seo_indexavel').eq('id', info.siteId).single(),
    ])

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Painel do Site</h1>
        <p className="text-[var(--muted)] text-sm">Edite o conteúdo, publique notícias e acompanhe os contatos recebidos.</p>
      </div>

      <Link
        href="/app/colegio-elite/leads"
        className="group flex items-center justify-between bg-[#0F1F3D] rounded-2xl px-7 py-6 mb-6 hover:bg-[#152a52] transition-colors shadow-lg"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">📥</div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">Leads recebidos</p>
            <p className="text-white/60 text-sm mt-0.5">Acompanhe os contatos e pedidos de visita do site</p>
          </div>
        </div>
        <div className="flex items-center gap-8 flex-shrink-0">
          {leadsHoje ? (
            <div className="text-center hidden sm:block">
              <p className="font-display font-extrabold text-[#1B3A6B] text-2xl">{leadsHoje}</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/app/colegio-elite/editor"
          className="group bg-[var(--card-bg)] border-2 border-[#1B3A6B]/30 hover:border-[#1B3A6B] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1B3A6B]/10 flex items-center justify-center text-xl mb-5">🎨</div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Editor do Site</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Edite textos, imagens e informações de cada seção — home, proposta pedagógica, ensino, estrutura e mais.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1B3A6B]">{totalSegmentos ?? 0} segmentos de ensino</span>
            <span className="text-[var(--border)]">·</span>
            <span className="text-xs text-[var(--muted)] group-hover:text-[#1B3A6B] transition-colors font-semibold">Editar →</span>
          </div>
        </Link>

        <Link
          href="/app/colegio-elite/blog"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-xl mb-5">✍️</div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Notícias / Blog</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Publique notícias e novidades da escola. Cada publicação aparece na seção de notícias do site.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--brand)]">{totalArtigos ?? 0} publicadas</span>
            <span className="text-[var(--border)]">·</span>
            <span className="text-xs text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors font-semibold">Escrever →</span>
          </div>
        </Link>

        <Link
          href="/app/colegio-elite/seo"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-xl mb-5">🔍</div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">SEO</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Interruptor que libera a indexação do site no Google.
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${siteSeo?.seo_indexavel ? 'text-[var(--brand)]' : 'text-amber-600'}`}>
              {siteSeo?.seo_indexavel ? '🌍 visível no Google' : '🙈 oculto do Google'}
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className="text-xs text-[var(--muted)] group-hover:text-[var(--brand)] transition-colors font-semibold">Ver →</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
