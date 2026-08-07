'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = ['novo', 'contatado', 'sem_interesse', 'convertido']

export interface LeadFormState {
  error?: string
  success?: boolean
}

/**
 * Atualiza o status de qualquer lead (site ou manual). RLS já
 * restringe UPDATE a super-admin, mas checamos aqui também pra dar
 * uma mensagem de erro decente em vez de um 42501 cru.
 */
export async function updateLeadStatus(id: string, status: string) {
  await requireSuperAdmin()

  if (!STATUS_VALIDOS.includes(status)) {
    throw new Error('Status inválido.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-site')
  revalidatePath('/admin/crm/leads-potenciais')
}

/**
 * Cria um lead potencial (prospecção manual) — sempre origem='manual'.
 */
export async function createLeadPotencial(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const nome = (formData.get('nome') as string)?.trim()
  const contato = (formData.get('contato') as string)?.trim() ?? ''
  const segmento = (formData.get('segmento') as string)?.trim() || null
  const notas = (formData.get('notas') as string)?.trim() || null

  if (!nome) {
    return { error: 'Nome da empresa é obrigatório.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign').insert({
    nome,
    contato,
    segmento,
    notas,
    origem: 'manual',
    status: 'novo',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/crm/leads-potenciais')
  return { success: true }
}

/**
 * Atualiza notas de um lead (usado no acompanhamento pós-contato).
 */
export async function updateLeadNotas(id: string, notas: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ notas })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais')
}

/**
 * Soft-delete de um lead potencial (não usamos DELETE de verdade,
 * mesmo padrão do resto da plataforma — não existe policy de delete).
 */
export async function archiveLeadPotencial(id: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais')
}
