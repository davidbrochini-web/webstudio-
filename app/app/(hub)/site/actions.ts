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
    })
    .eq('id', siteId)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/site')
  return { success: true }
}
