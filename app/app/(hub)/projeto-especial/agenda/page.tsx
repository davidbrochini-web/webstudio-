import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import AgendaSubNav from '@/components/app/AgendaSubNav'
import AgendaSemanal from '@/components/app/AgendaSemanal'

export default async function AgendaPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const [{ data: config }, { data: horarios }, { data: bloqueios }, { data: agendamentos }, { count: tiposCount }] =
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
      supabase.from('agendamento_tipos_consulta')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', info.siteId).eq('ativo', true),
    ])

  const temHorarios = (horarios ?? []).some(h => h.ativo)
  const temTipos = (tiposCount ?? 0) > 0

  return (
    <div className="max-w-6xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Agenda</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Agenda</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Toque num dia pra ver os horários. Toque num agendamento pra confirmar, cancelar ou marcar falta.
      </p>

      <AgendaSubNav />

      {!config ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Agenda ainda não configurada</p>
          <p className="text-[var(--muted)] text-sm mb-5">Defina os dias e horários de atendimento pra começar a receber agendamentos.</p>
          <Link href="/app/projeto-especial/agenda/configuracoes"
            className="inline-block text-sm font-semibold text-white bg-[var(--brand)] rounded-xl px-5 py-2.5">
            Configurar horários
          </Link>
        </div>
      ) : (!temHorarios || !temTipos) ? (
        // Onboarding: config existe (linha criada com valores padrão) mas
        // falta o essencial pro paciente conseguir agendar pelo site —
        // antes disso o calendário aparecia vazio sem explicar por quê,
        // o que confundia bastante (pedido do cliente pra explicar melhor).
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 sm:p-10">
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1 text-center">
            Faltam 2 passos pra agenda funcionar no site
          </p>
          <p className="text-[var(--muted)] text-sm text-center mb-8 max-w-md mx-auto">
            Enquanto isso, o calendário fica vazio e o formulário de agendamento no site não mostra nenhum horário disponível pro paciente escolher.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <div className={`rounded-2xl p-5 border-2 ${temTipos ? 'border-[var(--brand)]/30 bg-[var(--brand)]/5' : 'border-[var(--border)] bg-[var(--off)]'}`}>
              <p className="text-2xl mb-2">{temTipos ? '✅' : '🩺'}</p>
              <p className="font-display font-bold text-sm text-[var(--ink)] mb-1">1. Tipos de consulta</p>
              <p className="text-xs text-[var(--muted)] mb-3">Ex: Avaliação, Retorno, Cirurgia — cada um com sua duração.</p>
              {!temTipos && (
                <Link href="/app/projeto-especial/agenda/tipos-consulta"
                  className="inline-block text-xs font-semibold text-white bg-[var(--brand)] rounded-lg px-3.5 py-2">
                  Cadastrar tipos
                </Link>
              )}
            </div>
            <div className={`rounded-2xl p-5 border-2 ${temHorarios ? 'border-[var(--brand)]/30 bg-[var(--brand)]/5' : 'border-[var(--border)] bg-[var(--off)]'}`}>
              <p className="text-2xl mb-2">{temHorarios ? '✅' : '🕐'}</p>
              <p className="font-display font-bold text-sm text-[var(--ink)] mb-1">2. Dias e horários</p>
              <p className="text-xs text-[var(--muted)] mb-3">Quais dias da semana e em quais horários você atende.</p>
              {!temHorarios && (
                <Link href="/app/projeto-especial/agenda/configuracoes"
                  className="inline-block text-xs font-semibold text-white bg-[var(--brand)] rounded-lg px-3.5 py-2">
                  Configurar horários
                </Link>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-[var(--muted)] mt-6">
            Assim que os dois estiverem prontos, essa mensagem some e a agenda passa a valer no site.
          </p>
        </div>
      ) : (
        <AgendaSemanal
          config={config}
          horarios={horarios ?? []}
          bloqueios={bloqueios ?? []}
          agendamentos={(agendamentos ?? []) as never}
        />
      )}
    </div>
  )
}
