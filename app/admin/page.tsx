import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface StatCard {
  label: string
  value: string | number
  sub?: string
  color: string // classe de borda + texto
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
  ] = await Promise.all([
    supabase.from('tenants').select('id, status, is_demo').is('deleted_at', null),
    supabase.from('sites').select('id', { count: 'exact', head: true }).eq('status', 'publicado').is('deleted_at', null),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'ativo').is('deleted_at', null),
    supabase.from('site_leads').select('id', { count: 'exact', head: true }).gte('created_at', seteDiasAtras.toISOString()),
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

      <Link
        href="/admin/tenants"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"
      >
        Gerenciar tenants →
      </Link>
    </div>
  )
}
