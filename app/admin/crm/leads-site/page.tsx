import { createClient } from '@/lib/supabase/server'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'

export default async function LeadsSiteOmnidesignPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads_omnidesign')
    .select('id, nome, contato, mensagem, status, created_at')
    .eq('origem', 'site')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const agora = new Date()
  const hoje = leads?.filter(l => new Date(l.created_at).toDateString() === agora.toDateString()).length ?? 0
  const semana = leads?.filter(l => (agora.getTime() - new Date(l.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length ?? 0
  const total = leads?.length ?? 0

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Leads do site</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Pessoas que preencheram o formulário de contato do omnidesign.com.br. Uso interno da agência — não tem relação com os clientes.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Hoje', valor: hoje },
          { label: 'Últimos 7 dias', valor: semana },
          { label: 'Total', valor: total },
        ].map(k => (
          <div key={k.label} className="bg-white border border-[var(--border)] rounded-2xl p-5 text-center">
            <p className="font-display font-extrabold text-3xl text-[var(--ink)]">{k.valor}</p>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {!leads?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum lead ainda</p>
          <p className="text-[var(--muted)] text-sm">Quando alguém preencher o formulário do site, aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((l) => {
            const data = new Date(l.created_at)
            const ehHoje = data.toDateString() === agora.toDateString()
            return (
              <div key={l.id}
                className={`bg-white rounded-2xl border p-5 ${ehHoje ? 'border-[#0EA5A0]/40 shadow-sm' : 'border-[var(--border)]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[var(--ink)] text-base">{l.nome}</p>
                      {ehHoje && (
                        <span className="text-[10px] font-bold bg-[#0EA5A0] text-white px-2 py-0.5 rounded-full">Novo</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)]">{l.contato}</p>
                    {l.mensagem && (
                      <p className="text-sm text-[var(--ink)] mt-2 bg-[var(--off)] rounded-xl px-3 py-2 italic">
                        &ldquo;{l.mensagem}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-[var(--muted)]">
                      {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                    <LeadStatusSelect id={l.id} status={l.status} />
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
