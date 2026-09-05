import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'

export default async function LocaldeskLeadsPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('site_leads')
    .select('id, nome, contato, mensagem, data_desejada, periodo, created_at')
    .eq('site_id', info.siteId)
    .order('created_at', { ascending: false })
    .limit(200)

  const agora = new Date()
  const hoje = leads?.filter(l => new Date(l.created_at).toDateString() === agora.toDateString()).length ?? 0
  const semana = leads?.filter(l => {
    const d = new Date(l.created_at)
    return (agora.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  }).length ?? 0
  const total = leads?.length ?? 0

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/localdesk" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Leads recebidos</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Leads recebidos</h1>
      <p className="text-[var(--muted)] text-sm mb-8">Contatos vindos do formulário do site.</p>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Hoje', valor: hoje, cor: hoje > 0 ? '#12B886' : undefined },
          { label: 'Últimos 7 dias', valor: semana, cor: undefined },
          { label: 'Total', valor: total, cor: undefined },
        ].map(k => (
          <div key={k.label} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 text-center">
            <p className="font-display font-extrabold text-3xl" style={{ color: k.cor ?? 'var(--ink)' }}>
              {k.valor}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabela / lista */}
      {!leads?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum lead ainda</p>
          <p className="text-[var(--muted)] text-sm">Quando alguém preencher o formulário de contato do site, aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map(l => {
            const data = new Date(l.created_at)
            const ehHoje = data.toDateString() === agora.toDateString()
            return (
              <div key={l.id}
                className={`bg-[var(--card-bg)] rounded-2xl border p-5 ${
                  ehHoje ? 'border-[#12B886]/40 shadow-sm' : 'border-[var(--border)]'
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[var(--ink)] text-base">{l.nome}</p>
                      {ehHoje && (
                        <span className="text-[10px] font-bold bg-[#12B886] text-white px-2 py-0.5 rounded-full">Novo</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)]">{l.contato}</p>
                    {l.mensagem && (
                      <p className="text-sm text-[var(--ink)] mt-2 bg-[var(--off)] rounded-xl px-3 py-2 italic">
                        &ldquo;{l.mensagem}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--muted)]">
                      {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
