import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'
import ArchiveLeadButton from '@/components/admin/ArchiveLeadButton'
import LeadPotencialCard from '@/components/admin/LeadPotencialCard'

export default async function GerenciarLeadsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('leads_omnidesign')
    .select(`
      id, nome, telefone, email, segmento, notas, texto_envio,
      analise_pdf_url, proposta_pdf_url, status, created_at,
      created_by, criador:profiles!leads_omnidesign_created_by_fkey ( nome )
    `)
    .eq('origem', 'manual')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  const total = leads?.length ?? 0
  const emAberto = leads?.filter(l => l.status === 'novo' || l.status === 'contatado').length ?? 0
  const convertidos = leads?.filter(l => l.status === 'convertido').length ?? 0

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Gerenciar</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-display font-extrabold text-2xl text-[var(--ink)]">Gerenciar leads</h1>
        <Link
          href="/admin/crm/leads-potenciais/cadastrar"
          className="flex-shrink-0 text-sm font-semibold text-white bg-[var(--dark)] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          + Cadastrar lead
        </Link>
      </div>
      <p className="text-[var(--muted)] text-sm mb-8">Acompanhe o status e o histórico de cada empresa.</p>

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

      {!leads?.length ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">🗒️</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum lead cadastrado</p>
          <p className="text-[var(--muted)] text-sm mb-4">Cadastre a primeira empresa que você quer contatar.</p>
          <Link
            href="/admin/crm/leads-potenciais/cadastrar"
            className="inline-block text-sm font-semibold text-white bg-[var(--dark)] px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            + Cadastrar lead
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((l) => {
            const criador = Array.isArray(l.criador) ? l.criador[0] : l.criador
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-[var(--ink)] text-base">{l.nome}</p>
                      {l.segmento && (
                        <span className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--off)] px-2 py-0.5 rounded-full">
                          {l.segmento}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-[var(--muted)]">
                      {l.telefone && <span>📞 {l.telefone}</span>}
                      {l.email && <span>✉️ {l.email}</span>}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1">
                      Cadastrado por {criador?.nome ?? 'alguém da equipe'} · {new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <LeadStatusSelect id={l.id} status={l.status} />
                    <ArchiveLeadButton id={l.id} />
                  </div>
                </div>

                <LeadPotencialCard
                  id={l.id}
                  notas={l.notas}
                  textoEnvio={l.texto_envio}
                  analisePdfUrl={l.analise_pdf_url}
                  propostaPdfUrl={l.proposta_pdf_url}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
