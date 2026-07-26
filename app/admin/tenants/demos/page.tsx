import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DemosManager from '@/components/admin/DemosManager'

export default async function DemosPage() {
  const supabase = await createClient()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, nome, created_at, sites(slug, pagelayout)')
    .is('deleted_at', null)
    .eq('is_demo', true)
    .order('created_at', { ascending: false })

  const { data: leads } = await supabase
    .from('demo_leads')
    .select('id, tenant_id, nome, contato, created_at')
    .order('created_at', { ascending: false })

  const tenantsFormatted = (tenants ?? []).map(t => ({
    id: t.id,
    nome: t.nome,
    created_at: t.created_at,
    site: (t.sites as unknown as { slug: string; pagelayout: string }[] | null)?.[0] ?? null,
  }))

  return (
    <div>
      <Link href="/admin/tenants" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-2">Demos ativas</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Tenants criados por visitantes testando o produto sem login. Não há limpeza automática ainda — apague manualmente quando quiser.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemosManager tenants={tenantsFormatted} />

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="font-display font-bold text-base text-[var(--ink)] mb-4">
            Contatos capturados ({leads?.length ?? 0})
          </h2>
          {!leads?.length ? (
            <p className="text-sm text-[var(--muted)]">Nenhum contato capturado ainda.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {leads.map(l => (
                <li key={l.id} className="py-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{l.nome}</p>
                  <p className="text-xs text-[var(--muted)]">{l.contato}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    {new Date(l.created_at).toLocaleString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
