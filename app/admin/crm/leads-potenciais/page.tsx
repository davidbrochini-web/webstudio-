import { createClient } from '@/lib/supabase/server'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import NovoLeadPotencialForm from '@/components/admin/NovoLeadPotencialForm'
import ArchiveLeadButton from '@/components/admin/ArchiveLeadButton'

export default async function LeadsPotenciaisPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads_omnidesign')
    .select('id, nome, contato, segmento, notas, status, created_at')
    .eq('origem', 'manual')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const total = leads?.length ?? 0
  const emAberto = leads?.filter(l => l.status === 'novo' || l.status === 'contatado').length ?? 0
  const convertidos = leads?.filter(l => l.status === 'convertido').length ?? 0

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Leads potenciais</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Empresas que você quer contatar — cadastro manual, só seu, pra organizar a prospecção.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', valor: total },
          { label: 'Em aberto', valor: emAberto },
          { label: 'Convertidos', valor: convertidos },
        ].map(k => (
          <div key={k.label} className="bg-white border border-[var(--border)] rounded-2xl p-5 text-center">
            <p className="font-display font-extrabold text-3xl text-[var(--ink)]">{k.valor}</p>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      <NovoLeadPotencialForm />

      {!leads?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center mt-6">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum lead cadastrado</p>
          <p className="text-[var(--muted)] text-sm">Cadastre acima a primeira empresa que você quer contatar.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-6">
          {leads.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-[var(--ink)] text-base">{l.nome}</p>
                    {l.segmento && (
                      <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--off)] px-2 py-0.5 rounded-full">
                        {l.segmento}
                      </span>
                    )}
                  </div>
                  {l.contato && <p className="text-sm text-[var(--muted)]">{l.contato}</p>}
                  {l.notas && (
                    <p className="text-sm text-[var(--ink)] mt-2 bg-[var(--off)] rounded-xl px-3 py-2">
                      {l.notas}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <LeadStatusSelect id={l.id} status={l.status} />
                  <ArchiveLeadButton id={l.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
