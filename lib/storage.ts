import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_MB = 8

/**
 * Sobe uma foto pro bucket `site-fotos` sob o path `{siteId}/...` —
 * a policy de escrita do Storage exige exatamente essa convenção
 * (usa o primeiro segmento do path como site_id pra validar via
 * is_admin_of_site()). Devolve a URL pública já pronta pra usar.
 */
export async function uploadSiteFoto(siteId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande — o limite é ${MAX_SIZE_MB}MB.`)
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('site-fotos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Erro ao enviar foto: ${error.message}`)

  const { data } = supabase.storage.from('site-fotos').getPublicUrl(path)
  return data.publicUrl
}
