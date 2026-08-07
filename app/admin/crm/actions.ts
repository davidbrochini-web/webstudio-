'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = ['novo', 'contatado', 'em_negociacao', 'sem_interesse', 'convertido', 'perdido']

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
  const bairro = (formData.get('bairro') as string)?.trim() || null
  const endereco = (formData.get('endereco') as string)?.trim() || null
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
    bairro,
    endereco,
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
 * Atribui (ou remove) o responsável por tocar um lead — diferente de
 * created_by, que é fixo desde a criação. Qualquer super-admin pode
 * reatribuir (não só quem já é o responsável atual).
 */
export async function updateLeadResponsavel(id: string, responsavelId: string | null) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ responsavel_id: responsavelId })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
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
 * Gera o PDF de proposta automaticamente a partir dos dados do lead
 * (nome, segmento, bairro, avaliação Google) + logo/fotos que o
 * comercial subiu antes. Renderiza no servidor com @react-pdf/renderer,
 * sobe pro bucket leads-pdfs e grava em proposta_pdf_url — mesmo
 * campo usado pelo upload manual, só que preenchido automaticamente.
 */
export async function gerarPropostaPdf(id: string): Promise<{ error?: string; url?: string }> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('nome, segmento, bairro, endereco, telefone, nota_google, avaliacoes_google, logo_url, imagens_portfolio')
    .eq('id', id)
    .single()

  if (fetchError || !lead) return { error: 'Lead não encontrado.' }

  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { default: PropostaDocument } = await import('@/components/pdf/PropostaDocument')

    const buffer = await renderToBuffer(
      PropostaDocument({
        lead: {
          nome: lead.nome,
          segmento: lead.segmento,
          bairro: lead.bairro,
          endereco: lead.endereco,
          telefone: lead.telefone,
          notaGoogle: lead.nota_google,
          avaliacoesGoogle: lead.avaliacoes_google,
          logoUrl: lead.logo_url,
          imagensPortfolio: lead.imagens_portfolio ?? [],
        },
      })
    )

    const path = `${id}/proposta-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('leads-pdfs')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) return { error: `Erro ao salvar PDF: ${uploadError.message}` }

    const { data: signedData, error: signError } = await supabase.storage
      .from('leads-pdfs')
      .createSignedUrl(path, 60 * 60 * 24 * 365)

    if (signError || !signedData) return { error: `PDF gerado, mas erro ao criar link: ${signError?.message}` }

    const { error: updateError } = await supabase
      .from('leads_omnidesign')
      .update({ proposta_pdf_url: signedData.signedUrl })
      .eq('id', id)

    if (updateError) return { error: `PDF gerado, mas erro ao salvar no lead: ${updateError.message}` }

    revalidatePath('/admin/crm/leads-potenciais/gerenciar')
    return { url: signedData.signedUrl }
  } catch (err) {
    return { error: err instanceof Error ? `Erro ao gerar PDF: ${err.message}` : 'Erro ao gerar PDF.' }
  }
}

/**
 * Grava a URL do logo do lead (upload feito no client).
 */
export async function updateLeadLogo(id: string, url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign').update({ logo_url: url }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Adiciona uma foto de portfólio (append no array) — upload feito
 * no client, essa action só registra a URL.
 */
export async function addLeadImagemPortfolio(id: string, url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('imagens_portfolio')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const atual = lead?.imagens_portfolio ?? []
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ imagens_portfolio: [...atual, url] })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Remove uma foto de portfólio pelo índice.
 */
export async function removeLeadImagemPortfolio(id: string, index: number) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('imagens_portfolio')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const atual = (lead?.imagens_portfolio ?? []) as string[]
  const nova = atual.filter((_, i) => i !== index)
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ imagens_portfolio: nova })
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
