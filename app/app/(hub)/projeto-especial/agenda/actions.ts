'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATH = '/app/projeto-especial/agenda'

export interface PEFormState {
  error?: string
  success?: boolean
}

function friendlyError(error: { message: string; code?: string }): string {
  if (error.code === '23514' || error.message.includes('agendamento_horarios_intervalo_valido')) {
    return 'O horário final precisa ser depois do horário inicial.'
  }
  return error.message
}

// ── Configurações gerais (1 linha por site) ──────────────────────
export async function updateConfig(_prev: PEFormState, formData: FormData): Promise<PEFormState> {
  const siteId = formData.get('site_id') as string
  if (!siteId) return { error: 'site_id ausente.' }

  const duracaoSlot = parseInt(formData.get('duracao_slot_minutos') as string, 10)
  const intervalo = parseInt(formData.get('intervalo_minutos') as string, 10)
  const antecedencia = parseInt(formData.get('antecedencia_minima_horas') as string, 10)
  const janela = parseInt(formData.get('janela_maxima_dias') as string, 10)
  const maxPendentes = parseInt(formData.get('max_pendentes_por_telefone') as string, 10)

  if (!duracaoSlot || duracaoSlot <= 0) return { error: 'Duração do slot inválida.' }
  if (isNaN(intervalo) || intervalo < 0) return { error: 'Intervalo entre slots inválido.' }
  if (isNaN(antecedencia) || antecedencia < 0) return { error: 'Antecedência mínima inválida.' }
  if (!janela || janela <= 0) return { error: 'Janela máxima inválida.' }
  if (!maxPendentes || maxPendentes <= 0) return { error: 'Máximo de agendamentos pendentes inválido.' }

  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_config').update({
    duracao_slot_minutos: duracaoSlot,
    intervalo_minutos: intervalo,
    antecedencia_minima_horas: antecedencia,
    janela_maxima_dias: janela,
    max_pendentes_por_telefone: maxPendentes,
  }).eq('site_id', siteId)

  if (error) return { error: friendlyError(error) }

  revalidatePath(PATH)
  return { success: true }
}

// ── Horários (grade semanal — vários por dia, ex: manhã e tarde) ─
export interface HorarioData {
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  ativo: boolean
}

export async function upsertHorario(siteId: string, id: string | null, data: HorarioData) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('agendamento_horarios').update(data).eq('id', id)
    if (error) throw new Error(friendlyError(error))
  } else {
    const { error } = await supabase.from('agendamento_horarios').insert({ site_id: siteId, ...data })
    if (error) throw new Error(friendlyError(error))
  }
  revalidatePath(PATH)
}

export async function toggleHorarioAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_horarios').update({ ativo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(PATH)
}

export async function deleteHorario(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_horarios').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(PATH)
}

// ── Tipos de consulta (E3) ────────────────────────────────────────
const TIPOS_PATH = '/app/projeto-especial/agenda/tipos-consulta'

export interface TipoConsultaData {
  nome: string
  duracao_minutos: number
  ativo: boolean
}

export async function upsertTipoConsulta(siteId: string, id: string | null, data: TipoConsultaData) {
  if (!data.nome.trim()) throw new Error('Preencha o nome do tipo de consulta.')
  if (!data.duracao_minutos || data.duracao_minutos <= 0) throw new Error('Duração inválida.')

  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('agendamento_tipos_consulta').update(data).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { count } = await supabase.from('agendamento_tipos_consulta')
      .select('*', { count: 'exact', head: true }).eq('site_id', siteId)
    const { error } = await supabase.from('agendamento_tipos_consulta')
      .insert({ site_id: siteId, ordem: count ?? 0, ...data })
    if (error) throw new Error(error.message)
  }
  revalidatePath(TIPOS_PATH)
}

export async function toggleTipoConsultaAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_tipos_consulta').update({ ativo }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(TIPOS_PATH)
}

export async function deleteTipoConsulta(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_tipos_consulta').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(TIPOS_PATH)
}

// ── Bloqueios de datas (E4) ───────────────────────────────────────
const BLOQUEIOS_PATH = '/app/projeto-especial/agenda/bloqueios'

export interface BloqueioData {
  data: string       // YYYY-MM-DD
  hora_inicio: string | null
  hora_fim: string | null
  motivo: string | null
}

export async function criarBloqueio(siteId: string, data: BloqueioData) {
  if (!data.data) throw new Error('Selecione a data.')
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_bloqueios')
    .insert({ site_id: siteId, ...data })
  if (error) {
    if (error.code === '23514' || error.message.includes('janela_consistente'))
      throw new Error('Informe horário de início e fim, ou deixe os dois vazios para bloquear o dia inteiro.')
    throw new Error(error.message)
  }
  revalidatePath(BLOQUEIOS_PATH)
}

export async function deleteBloqueio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamento_bloqueios').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(BLOQUEIOS_PATH)
}

// ── Agenda da Semana — ações em agendamentos (E5+E8) ──────────────
const SEMANA_PATH = '/app/projeto-especial/agenda/semana'

export type StatusAgendamento = 'pendente' | 'confirmado' | 'realizado' | 'cancelado' | 'falta'

export async function mudarStatusAgendamento(id: string, status: StatusAgendamento) {
  const supabase = await createClient()
  const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(SEMANA_PATH)
  revalidatePath('/app/projeto-especial/agenda')
}
