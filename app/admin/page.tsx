import { createClient } from '@/lib/supabase/server'
import { DOMAIN_MAP } from '@/lib/domain-map'
import Link from 'next/link'

interface StatCard {
  label: string
  value: string | number
  sub?: string
  color: string // classe de borda + texto
}

// Domínio → path (DOMAIN_MAP) invertido pra path → domínio, ignorando
// entradas "www." (prefere o domínio "limpo") e comentários/entradas
// desativadas (essas simplesmente não existem no objeto em runtime).
const PATH_TO_DOMAIN: Record<string, string> = {}
for (const [domain, path] of Object.entries(DOMAIN_MAP)) {
  if (domain.startsWith('www.')) continue
  PATH_TO_DOMAIN[path] = domain
}

function siteUrl(projetoEspecialSlug: string | null, siteSlug: string | null): string | null {
  if (projetoEspecialSlug) {
    const path = `/projetos-especiais/${projetoEspecialSlug}`
    const dominio = PATH_TO_DOMAIN[path]
    // Em produção (domínio próprio já apontado): link limpo.
    // Ainda em homologação (sem domínio configurado): path interno,
    // relativo — abre no mesmo host que o admin.
    return dominio ? `https://${dominio}` : path
  }
  if (siteSlug) return `/sandbox/${siteSlug}`
  return null
}

export default async function AdminHome() {
  const supabase = await createClient()

  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

  const [
    { data: tenants },
    { count: sitesPublicados },
    { count: modulosAtivos },
    { count: leadsRecentes },
    { data: recentes },
  ] = await Promise.all([
    supabase.from('tenants').select('id, status, is_demo').is('deleted_at', null),
    supabase
      .from('sites')
      .select('id, tenant:tenants!inner(is_demo, deleted_at)', { count: 'exact', head: true })
      .eq('status', 'publicado')
      .is('deleted_at', null)
      .eq('tenant.is_demo', false)
      .is('tenant.deleted_at', null),
    supabase
      .from('subscriptions')
      .select('id, tenant:tenants!inner(is_demo, deleted_at)', { count: 'exact', head: true })
      .eq('status', 'ativo')
      .is('deleted_at', null)
      .eq('tenant.is_demo', false)
      .is('tenant.deleted_at', null),
    supabase
      .from('site_leads')
      .select('id, site:sites!inner(tenant:tenants!inner(is_demo, deleted_at))', { count: 'exact', head: true })
      .gte('created_at', seteDiasAtras.toISOString())
      .eq('site.tenant.is_demo', false)
      .is('site.tenant.deleted_at', null),
    supabase
      .from('tenants')
      .select('id, nome, plano, status, projeto_especial_slug, created_at, sites(slug, status)')
      .is('deleted_at', null)
      .eq('is_demo', false)
      .order('created_at', { ascending: false })
      .limit(9),
  ])

  const reais = (tenants ?? []).filter(t => !t.is_demo)
  const demos = (tenants ?? []).filter(t => t.is_demo)
  const ativos = reais.filter(t => t.status === 'ativo').length

  const cards: StatCard[] = [
    { label: 'Clientes ativos', value: ativos, sub: `de ${reais.length} no total`, color: 'border-l-[var(--green)] text-[var(--green)]' },
    { label: 'Total de tenants', value: reais.length, sub: 'clientes reais', color: 'border-l-blue-500 text-blue-600' },
    { label: 'Demos ativas', value: demos.length, sub: 'testando agora', color: 'border-l-amber-500 text-amber-600' },
    { label: 'Sites publicados', value: sitesPublicados ?? 0, sub: 'no ar', color: 'border-l-purple-500 text-purple-600' },
    { label: 'Módulos ativos', value: modulosAtivos ?? 0, sub: 'somando todos os tenants', color: 'border-l-[var(--brand)] text-[var(--brand)]' },
    { label: 'Leads (7 dias)', value: leadsRecentes ?? 0, sub: 'formulário de contato dos sites', color: 'border-l-red-500 text-red-600' },
  ]

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">
        Dashboard
      </h1>
      <p className="text-sm text-[var(--muted)] mb-8">Visão geral em tempo real</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`bg-[var(--card-bg)] border border-[var(--border)] border-l-4 ${c.color.split(' ')[0]} rounded-xl p-5`}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] mb-2">{c.label}</p>
            <p className={`font-display font-extrabold text-3xl ${c.color.split(' ')[1]}`}>{c.value}</p>
            {c.sub && <p className="text-xs text-[var(--muted)] mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-[var(--ink)] mb-3">Tenants recentes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {(recentes ?? []).map(t => {
          const site = Array.isArray(t.sites) ? t.sites[0] : t.sites
          const url = siteUrl(t.projeto_especial_slug, site?.slug ?? null)
          return (
            <div key={t.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-[var(--ink)] text-sm leading-tight">{t.nome}</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                  t.status === 'ativo' ? 'bg-[var(--green)]/15 text-[var(--green)]' : 'bg-[var(--muted)]/15 text-[var(--muted)]'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {t.plano}{site?.status ? ` · site ${site.status}` : ''}
              </p>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  className="mt-2 inline-flex items-center justify-center text-xs font-semibold text-white bg-[var(--brand)] rounded-lg px-3 py-2 hover:opacity-90 transition-opacity"
                >
                  Ver site →
                </a>
              ) : (
                <span className="mt-2 text-xs text-[var(--muted)]">Sem site ainda</span>
              )}
            </div>
          )
        })}
      </div>

      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"
      >
        Ver todos os tenants →
      </Link>
    </div>
  )
}
