'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SiteIdentityFormState {
  error?: string
  success?: boolean
}

export async function updateSiteIdentity(
  _prev: SiteIdentityFormState,
  formData: FormData
): Promise<SiteIdentityFormState> {
  const siteId = formData.get('site_id') as string
  const businessName = (formData.get('business_name') as string)?.trim()
  const tagline = (formData.get('tagline') as string)?.trim() ?? ''
  const heroTitle = (formData.get('hero_title') as string)?.trim()
  const heroSub = (formData.get('hero_sub') as string)?.trim() ?? ''
  const ctaLabel = (formData.get('cta_label') as string)?.trim() || 'Fale conosco'
  const whatsapp = (formData.get('whatsapp') as string)?.replace(/\D/g, '') || null
  const instagramHandle = (formData.get('instagram_handle') as string)?.trim() || null

  // Campos institucionais — só chegam preenchidos quando o form é
  // renderizado com extended=true (hoje: LocalDesk); pros clientes do
  // catálogo genérico o campo simplesmente não existe no FormData
  // (FormData.get devolve null), então o update vira null ali também
  // — sem problema, a coluna já era nullable e eles não usam essa parte.
  const telefone = formData.has('telefone') ? (formData.get('telefone') as string)?.replace(/\D/g, '') || null : undefined
  const endereco = formData.has('endereco') ? (formData.get('endereco') as string)?.trim() || null : undefined
  const missao = formData.has('missao') ? (formData.get('missao') as string)?.trim() || null : undefined
  const visao = formData.has('visao') ? (formData.get('visao') as string)?.trim() || null : undefined
  const valores = formData.has('valores') ? (formData.get('valores') as string)?.trim() || null : undefined

  if (!siteId || !businessName || !heroTitle) {
    return { error: 'Nome do negócio e título do hero são obrigatórios.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .update({
      business_name: businessName,
      tagline,
      hero_title: heroTitle,
      hero_sub: heroSub,
      cta_label: ctaLabel,
      whatsapp,
      instagram_handle: instagramHandle,
      ...(telefone !== undefined ? { telefone } : {}),
      ...(endereco !== undefined ? { endereco } : {}),
      ...(missao !== undefined ? { missao } : {}),
      ...(visao !== undefined ? { visao } : {}),
      ...(valores !== undefined ? { valores } : {}),
    })
    .eq('id', siteId)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/site')
  revalidatePath('/app/localdesk')
  return { success: true }
}
