import Link from 'next/link'
import { getAuditoriasSimulador } from '@/app/admin/crm/inteligencia-actions'
import AuditoriaSimuladorList from '@/components/admin/AuditoriaSimuladorList'

export default async function AuditoriasSimuladorPage() {
  const auditorias = await getAuditoriasSimulador()
  const pendentes = auditorias.filter(a => a.status === 'pendente')
  const resolvidas = auditorias.filter(a => a.status === 'resolvido')

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Auditorias do Simulador</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Auditorias do Simulador</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Problemas reportados no cliente automático durante o treino — cada um vem com a conversa inteira até
        o momento do report. Marca como resolvido depois de ajustar a lógica em lib/crm-simulador-roteiros.ts.
      </p>

      {auditorias.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma auditoria reportada ainda.</p>
      ) : (
        <AuditoriaSimuladorList pendentes={pendentes} resolvidas={resolvidas} />
      )}
    </div>
  )
}
