import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import AgendaSubNav from '@/components/app/AgendaSubNav'
import TiposConsultaManager from '@/components/app/TiposConsultaManager'

export default async function TiposConsultaPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: tipos } = await supabase
    .from('agendamento_tipos_consulta')
    .select('id, nome, duracao_minutos, ativo')
    .eq('site_id', info.siteId)
    .order('ordem')
    .order('nome')

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <Link href="/app/projeto-especial/agenda" className="hover:text-[var(--ink)] transition-colors">Agenda</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Tipos de Consulta</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Agenda</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Configure a duração dos atendimentos e os dias/horários em que a clínica recebe pacientes.
      </p>

      <AgendaSubNav />

      <TiposConsultaManager siteId={info.siteId} tipos={tipos ?? []} />
    </div>
  )
}
