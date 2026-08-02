import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import AgendaSubNav from '@/components/app/AgendaSubNav'
import AgendaConfigForm from '@/components/app/AgendaConfigForm'

export default async function AgendaPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: config }, { data: horarios }] = await Promise.all([
    supabase.from('agendamento_config')
      .select('duracao_slot_minutos, intervalo_minutos, antecedencia_minima_horas, janela_maxima_dias, max_pendentes_por_telefone')
      .eq('site_id', info.siteId).single(),
    supabase.from('agendamento_horarios')
      .select('id, dia_semana, hora_inicio, hora_fim, ativo')
      .eq('site_id', info.siteId).order('dia_semana').order('hora_inicio'),
  ])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Agenda</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Agenda</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Configure a duração dos atendimentos e os dias/horários em que a clínica recebe pacientes.
      </p>

      <AgendaSubNav />

      {!config ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Configuração não encontrada</p>
          <p className="text-[var(--muted)] text-sm">Fale com o suporte pra inicializar a agenda deste site.</p>
        </div>
      ) : (
        <AgendaConfigForm siteId={info.siteId} config={config} horarios={horarios ?? []} />
      )}
    </div>
  )
}
