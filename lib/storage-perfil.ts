import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_MB = 8

/**
 * Sobe a foto de perfil da pessoa logada pro bucket `perfil-fotos`,
 * path `{userId}/...` (a policy de escrita exige exatamente essa
 * convenção). Bucket é público pra leitura — a foto aparece na
 * navbar sem round-trip de auth.
 */
export async function uploadPerfilFoto(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande — o limite é ${MAX_SIZE_MB}MB.`)
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('perfil-fotos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Erro ao enviar foto: ${error.message}`)

  const { data } = supabase.storage.from('perfil-fotos').getPublicUrl(path)
  return data.publicUrl
}
