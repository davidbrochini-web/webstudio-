import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import ProjetoEspecialSubNav from '@/components/app/ProjetoEspecialSubNav'

export default async function LeadsPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return <p className="text-sm text-[var(--muted)]">Site não encontrado pra esse tenant.</p>

  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('site_leads')
    .select('id, nome, contato, mensagem, data_desejada, periodo, created_at')
    .eq('site_id', info.siteId)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Site</h1>
      <ProjetoEspecialSubNav />

      {!leads?.length ? (
        <p className="text-sm text-[var(--muted)]">Nenhum lead recebido ainda.</p>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Recebido em</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Nome</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Contato</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Data desejada</th>
                <th className="px-4 py-2.5 font-medium text-[var(--muted)]">Período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {leads.map(l => (
                <tr key={l.id}>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-2.5 text-[var(--ink)] font-medium">{l.nome}</td>
                  <td className="px-4 py-2.5 text-[var(--ink)]">{l.contato}{l.mensagem ? ` · ${l.mensagem}` : ''}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)]">{l.data_desejada ? new Date(l.data_desejada + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="px-4 py-2.5 text-[var(--muted)] capitalize">{l.periodo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
