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
