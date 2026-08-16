import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DemosManager from '@/components/admin/DemosManager'

export default async function DemosPage() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome, created_at, deleted_at, sites(slug, pagelayout), lead:leads_omnidesign(id, nome, status)')
    .eq('is_demo', true)
    .order('created_at', { ascending: false })

  const tenantsFormatted = (tenants ?? []).map(t => {
    const lead = Array.isArray(t.lead) ? t.lead[0] : t.lead
    return {
      id: t.id,
      nome: t.nome,
      created_at: t.created_at,
      site: (t.sites as unknown as { slug: string; pagelayout: string }[] | null)?.[0] ?? null,
      leadNome: lead?.nome ?? null,
      leadStatus: lead?.status ?? null,
      soft_deletada: Boolean(t.deleted_at),
    }
  })

  const ativas = tenantsFormatted.filter(t => !t.soft_deletada)
  const aguardandoPurge = tenantsFormatted.filter(t => t.soft_deletada)

  return (
    <div>
      <Link href="/admin/tenants" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-2">Demos</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Demos nascem ligadas a um lead do CRM (criadas pelo atendente durante a negociação — aba Proposta do modal de atendimento).
        Quando o lead é marcado como perdido, a demo soft-deleta sozinha e é apagada de vez em até 7 dias (cron diário).
        Apagar manualmente aqui também funciona e é imediato.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemosManager tenants={ativas} />

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">
            Aguardando purge ({aguardandoPurge.length})
          </h2>
          <p className="text-xs text-[var(--muted)] mb-4">Lead perdido — some sozinha em até 7 dias, ou apague na hora abaixo.</p>
          {!aguardandoPurge.length ? (
            <p className="text-sm text-[var(--muted)]">Nenhuma demo aguardando purge.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {aguardandoPurge.map(t => (
                <li key={t.id} className="py-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{t.nome}</p>
                  <p className="text-xs text-[var(--muted)]">{t.leadNome ? `Lead: ${t.leadNome}` : 'Sem lead vinculado'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
