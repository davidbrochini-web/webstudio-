import { createClient } from '@/lib/supabase/server'

export interface AgendamentoPublicData {
  config: {
    duracao_slot_minutos: number
    intervalo_minutos: number
    antecedencia_minima_horas: number
    janela_maxima_dias: number
  } | null
  horarios: { dia_semana: number; hora_inicio: string; hora_fim: string }[]
  bloqueios: { data: string; hora_inicio: string | null; hora_fim: string | null }[]
  ocupados: { data: string; hora_inicio: string; hora_fim: string }[]
  tiposConsulta: { id: string; nome: string; duracao_minutos: number }[]
}

export async function getAgendamentoData(siteId: string): Promise<AgendamentoPublicData> {
  const supabase = await createClient()
  const [{ data: config }, { data: horarios }, { data: bloqueios }, { data: tiposConsulta }] =
    await Promise.all([
      supabase.from('agendamento_config')
        .select('duracao_slot_minutos, intervalo_minutos, antecedencia_minima_horas, janela_maxima_dias')
        .eq('site_id', siteId).maybeSingle(),
      supabase.from('agendamento_horarios')
        .select('dia_semana, hora_inicio, hora_fim')
        .eq('site_id', siteId).eq('ativo', true),
      supabase.from('agendamento_bloqueios')
        .select('data, hora_inicio, hora_fim')
        .eq('site_id', siteId)
        .gte('data', new Date().toISOString().slice(0, 10)),
      supabase.from('agendamento_tipos_consulta')
        .select('id, nome, duracao_minutos')
        .eq('site_id', siteId).eq('ativo', true).order('ordem'),
    ])

  // Slots ocupados via RPC (security definer, sem expor dados de paciente)
  const today = new Date().toISOString().slice(0, 10)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + (config?.janela_maxima_dias ?? 60))
  const { data: ocupados } = await supabase.rpc('agendamento_slots_ocupados', {
    p_site_id: siteId,
    p_data_inicio: today,
    p_data_fim: maxDate.toISOString().slice(0, 10),
  })

  return {
    config,
    horarios: horarios ?? [],
    bloqueios: bloqueios ?? [],
    ocupados: (ocupados ?? []) as { data: string; hora_inicio: string; hora_fim: string }[],
    tiposConsulta: tiposConsulta ?? [],
  }
}
