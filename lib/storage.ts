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

/**
 * Sobe um PDF (análise ou proposta) de um lead potencial pro bucket
 * `leads-pdfs` (PRIVADO — documento comercial interno, diferente dos
 * buckets públicos de foto). Path `{leadId}/{tipo}-{timestamp}.pdf`.
 */
export async function uploadLeadPdf(leadId: string, tipo: 'analise' | 'proposta', file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Envie um arquivo PDF.')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Arquivo muito grande — o limite é ${MAX_SIZE_MB}MB.`)
  }

  const supabase = createClient()
  const path = `${leadId}/${tipo}-${Date.now()}.pdf`

  const { error } = await supabase.storage.from('leads-pdfs').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw new Error(`Erro ao enviar PDF: ${error.message}`)

  // Bucket privado: não tem URL pública. Gera signed URL válida por 1
  // ano — tempo suficiente pra não precisar re-gerar toda hora, mas
  // ainda expira (não é um link público permanente).
  const { data, error: signError } = await supabase.storage
    .from('leads-pdfs')
    .createSignedUrl(path, 60 * 60 * 24 * 365)
  if (signError || !data) throw new Error(`PDF enviado, mas erro ao gerar link: ${signError?.message}`)

  return data.signedUrl
}
export async function uploadContoImagem(siteId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande — o limite é ${MAX_SIZE_MB}MB.`)
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('contos-imagens').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`)

  const { data } = supabase.storage.from('contos-imagens').getPublicUrl(path)
  return data.publicUrl
}
