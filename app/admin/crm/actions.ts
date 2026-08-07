'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = ['novo', 'contatado', 'sem_interesse', 'convertido']

export interface LeadFormState {
  error?: string
  success?: boolean
  id?: string
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
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Cria um lead potencial (prospecção manual) — sempre origem='manual'.
 * Grava created_by com o id de quem cadastrou (pedido do David: saber
 * quem cadastrou cada lead, útil já que agora tem mais de uma pessoa
 * usando o admin).
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const nome = (formData.get('nome') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const segmento = (formData.get('segmento') as string)?.trim() || null
  const notas = (formData.get('notas') as string)?.trim() || null
  const texto_envio = (formData.get('texto_envio') as string)?.trim() || null

  if (!nome) {
    return { error: 'Nome da empresa é obrigatório.' }
  }

  const { data, error } = await supabase.from('leads_omnidesign').insert({
    nome,
    telefone,
    email,
    segmento,
    notas,
    texto_envio,
    origem: 'manual',
    status: 'novo',
    created_by: user.id,
  }).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
  return { success: true, id: data.id }
}

/**
 * Salva as URLs dos PDFs (análise/proposta) depois do upload no
 * client — o upload em si acontece direto no browser (mesmo padrão
 * de uploadSiteFoto), essa action só grava a URL resultante.
 */
export async function updateLeadPdfs(id: string, campo: 'analise_pdf_url' | 'proposta_pdf_url', url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ [campo]: url })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Atualiza campos de acompanhamento de um lead potencial (notas,
 * texto de envio) — usado na tela de gerenciamento.
 */
export async function updateLeadCampos(id: string, campos: { notas?: string; texto_envio?: string }) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update(campos)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
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

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}
