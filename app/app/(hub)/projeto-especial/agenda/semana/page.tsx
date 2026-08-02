import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import AgendaSubNav from '@/components/app/AgendaSubNav'
import AgendaSemanal from '@/components/app/AgendaSemanal'

export default async function AgendaSemanaPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: config }, { data: horarios }, { data: bloqueios }, { data: agendamentos }] =
    await Promise.all([
      supabase.from('agendamento_config')
        .select('duracao_slot_minutos, intervalo_minutos')
        .eq('site_id', info.siteId).single(),
      supabase.from('agendamento_horarios')
        .select('dia_semana, hora_inicio, hora_fim, ativo')
        .eq('site_id', info.siteId),
      supabase.from('agendamento_bloqueios')
        .select('data, hora_inicio, hora_fim, motivo')
        .eq('site_id', info.siteId),
      supabase.from('agendamentos')
        .select('id, data, hora_inicio, hora_fim, paciente_nome, paciente_telefone, paciente_email, status, tipo_consulta:agendamento_tipos_consulta(nome)')
        .eq('site_id', info.siteId)
        .neq('status', 'cancelado')
        .order('data')
        .order('hora_inicio'),
    ])

  if (!config) return null

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <Link href="/app/projeto-especial/agenda" className="hover:text-[var(--ink)] transition-colors">Agenda</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Agenda da Semana</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Agenda</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Visão semanal dos atendimentos — clique em um agendamento para ver detalhes e mudar o status.
      </p>

      <AgendaSubNav />

      <AgendaSemanal
        config={config}
        horarios={horarios ?? []}
        bloqueios={bloqueios ?? []}
        agendamentos={(agendamentos ?? []) as never}
      />
    </div>
  )
}
