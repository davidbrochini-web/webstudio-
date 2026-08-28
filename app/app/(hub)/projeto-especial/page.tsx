import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import { getPendenciaAtual } from '@/lib/assinatura-server'
import Link from 'next/link'

export default async function ProjetoEspecialHome() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()

  // Contadores pra mostrar no dashboard
  const hoje = new Date(new Date().setHours(0,0,0,0)).toISOString()
  const [
    { count: totalLeads }, { count: leadsHoje }, { count: totalArtigos }, { count: totalTratamentos },
    { count: agHoje }, { count: agPendentes }, { data: siteSeo }, { data: ultimoArtigo }, { totalCentavos: pendenciaCentavos },
  ] =
    await Promise.all([
      supabase.from('site_leads').select('*', { count: 'exact', head: true }).eq('site_id', info.siteId),
      supabase.from('site_leads').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).gte('created_at', hoje),
      supabase.from('site_blog_posts').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).is('deleted_at', null).eq('publicado', true),
      supabase.from('site_tratamentos').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).is('deleted_at', null),
      supabase.from('agendamentos').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).eq('data', new Date().toISOString().slice(0, 10))
        .neq('status', 'cancelado'),
      supabase.from('agendamentos').select('*', { count: 'exact', head: true })
        .eq('site_id', info.siteId).eq('status', 'pendente'),
      supabase.from('sites').select('seo_indexavel').eq('id', info.siteId).single(),
      supabase.from('site_blog_posts').select('created_at')
        .eq('site_id', info.siteId).is('deleted_at', null).eq('publicado', true)
        .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      getPendenciaAtual(info.tenantId),
    ])

  const diasDesdeUltimoPost = ultimoArtigo?.created_at
    ? Math.floor((Date.now() - new Date(ultimoArtigo.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const precisaPublicar = diasDesdeUltimoPost === null || diasDesdeUltimoPost >= 7

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

      {/* Principais: Editor, Blog (com lembrete), Agenda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
          className={`group bg-[var(--card-bg)] rounded-2xl p-7 transition-all hover:shadow-lg ${
            precisaPublicar ? 'border-2 border-amber-300 hover:border-amber-400' : 'border border-[var(--border)] hover:border-[var(--brand)]'
          }`}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-xl">
              ✍️
            </div>
            {precisaPublicar && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                Publicar
              </span>
            )}
          </div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Blog / Artigos</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            {precisaPublicar
              ? diasDesdeUltimoPost === null
                ? 'Não esqueça a publicação semanal — você ainda não publicou nenhum artigo.'
                : `Não esqueça a publicação semanal — o último artigo foi há ${diasDesdeUltimoPost} dias.`
              : 'Publique artigos, dicas e novidades da clínica. Cada publicação aparece na seção de novidades do site.'}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${precisaPublicar ? 'text-amber-600' : 'text-[var(--brand)]'}`}>{totalArtigos ?? 0} publicados</span>
            <span className="text-[var(--border)]">·</span>
            <span className={`text-xs text-[var(--muted)] transition-colors font-semibold ${precisaPublicar ? 'group-hover:text-amber-600' : 'group-hover:text-[var(--brand)]'}`}>Escrever →</span>
          </div>
        </Link>

        <Link
          href="/app/projeto-especial/agenda"
          className="group bg-[var(--card-bg)] border-2 border-[#0EA5A0]/30 hover:border-[#0EA5A0] rounded-2xl p-7 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0EA5A0]/10 flex items-center justify-center text-xl mb-5">
            🗓️
          </div>
          <h2 className="font-display font-bold text-[var(--ink)] text-lg mb-2">Agenda</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-5">
            Configure dias, horários e regras de agendamento de consultas.
          </p>
          <div className="flex items-center gap-2">
            {(agHoje ?? 0) > 0 && (
              <>
                <span className="text-xs font-semibold text-[#0EA5A0]">{agHoje} hoje</span>
                <span className="text-[var(--border)]">·</span>
              </>
            )}
            {(agPendentes ?? 0) > 0 && (
              <>
                <span className="text-xs font-semibold text-amber-600">{agPendentes} pendente{agPendentes !== 1 ? 's' : ''}</span>
                <span className="text-[var(--border)]">·</span>
              </>
            )}
            <span className="text-xs text-[var(--muted)] group-hover:text-[#0EA5A0] transition-colors font-semibold">Configurar →</span>
          </div>
        </Link>
      </div>

      {/* Acesso rápido: SEO, Assinatura, Módulos extras */}
      <h2 className="font-display font-bold text-sm text-[var(--muted)] uppercase tracking-wide mb-3">Acesso rápido</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/app/projeto-especial/seo"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-5 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">🔍</span>
            <h3 className="font-display font-bold text-[var(--ink)] text-sm">SEO</h3>
          </div>
          <p className={`text-xs font-semibold ${siteSeo?.seo_indexavel ? 'text-[var(--brand)]' : 'text-amber-600'}`}>
            {siteSeo?.seo_indexavel ? '🌍 visível no Google' : '🙈 oculto do Google'}
          </p>
        </Link>

        <Link
          href="/app/projeto-especial/assinatura"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-5 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">💳</span>
            <h3 className="font-display font-bold text-[var(--ink)] text-sm">Assinatura</h3>
          </div>
          <p className={`text-xs font-semibold ${pendenciaCentavos > 0 ? 'text-red-600' : 'text-[var(--muted)]'}`}>
            {pendenciaCentavos > 0 ? 'Pagamento pendente' : 'Tudo em dia'}
          </p>
        </Link>

        <Link
          href="/app/projeto-especial/assinatura#modulos-disponiveis"
          className="group bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--brand)] rounded-xl p-5 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">➕</span>
            <h3 className="font-display font-bold text-[var(--ink)] text-sm">Módulos extras</h3>
          </div>
          <p className="text-xs font-semibold text-[var(--muted)]">Instagram, Financeiro, CRM e mais</p>
        </Link>
      </div>
    </div>
  )
}
