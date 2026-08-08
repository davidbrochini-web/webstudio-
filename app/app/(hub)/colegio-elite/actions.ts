'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PEFormState {
  error?: string
  success?: boolean
}

function revalidateAll() {
  revalidatePath('/app/colegio-elite', 'layout')
  revalidatePath('/projetos-especiais/colegio-elite', 'layout')
}

/** Traduz o erro cru do Postgres — em especial a violação de
 *  unique(site_id, slug), que aparece toda vez que o slug já existe. */
function friendlyError(error: { message: string; code?: string }): string {
  if (error.code === '23505' || error.message.includes('duplicate key')) {
    return 'Esse endereço de URL já está em uso por outro item. Escolha outro.'
  }
  return error.message
}

// ── Campos diretos da tabela sites ──────────────────────────────
const ALLOWED_SITE_FIELDS = [
  'business_name', 'tagline', 'hero_title', 'hero_sub', 'hero_imagem_url', 'logo_url',
  'telefone', 'whatsapp', 'instagram_handle', 'endereco', 'status',
  'missao', 'visao', 'valores', 'logo_posicao',
] as const
type SiteField = typeof ALLOWED_SITE_FIELDS[number]

export async function updateSiteFieldCE(siteId: string, field: SiteField, value: string) {
  if (!ALLOWED_SITE_FIELDS.includes(field)) throw new Error('Campo inválido.')
  const supabase = await createClient()
  let cleanValue = field === 'whatsapp' ? value.replace(/\D/g, '') : value

  if (field === 'logo_posicao' && !['esquerda', 'centro'].includes(value)) {
    throw new Error('Posição inválida.')
  }

  if (field === 'instagram_handle' && cleanValue.trim() !== '') {
    cleanValue = cleanValue.trim().replace(/^@/, '')
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanValue)) {
      throw new Error('Usuário do Instagram inválido — use só o @usuario (sem espaços).')
    }
  }

  const { error } = await supabase.from('sites').update({ [field]: cleanValue }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function updateInstagramVisivel(siteId: string, visivel: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ instagram_visivel: visivel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

type CampoVisibilidade = 'secao_diferenciais_visivel' | 'secao_segmentos_visivel'
  | 'secao_faq_visivel' | 'secao_artigos_visivel'

export async function toggleSecaoVisivelCE(siteId: string, campo: CampoVisibilidade, visivel: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ [campo]: visivel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function toggleSeoIndexavelCE(siteId: string, indexavel: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ seo_indexavel: indexavel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function updateTextoCustomizadoCE(siteId: string, chave: string, valor: string) {
  const supabase = await createClient()
  const { data: site } = await supabase.from('sites').select('textos_customizados').eq('id', siteId).single()
  const atual = (site?.textos_customizados ?? {}) as Record<string, string>
  const novo = { ...atual, [chave]: valor }
  const { error } = await supabase.from('sites').update({ textos_customizados: novo }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Diferenciais (grid simples, sem página de detalhe) ───────────
export interface DiferencialData { icone?: string; titulo?: string; texto?: string }

export async function upsertDiferencialInline(siteId: string, id: string | null, data: DiferencialData) {
  const supabase = await createClient()
  const payload = { site_id: siteId, ...data }
  const { data: row, error } = id
    ? await supabase.from('site_diferenciais').update(data).eq('id', id).select().single()
    : await supabase.from('site_diferenciais').insert(payload).select().single()
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
  return row
}

export async function deleteDiferencialInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_diferenciais').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Segmentos de Ensino (com página de detalhe, slug) ────────────
export interface SegmentoData {
  slug?: string; titulo?: string; resumo?: string; texto_completo?: string
  imagem_url?: string; meta_titulo?: string; publicado?: boolean
}

export async function upsertSegmentoInline(siteId: string, id: string | null, data: SegmentoData) {
  const supabase = await createClient()
  const payload = { site_id: siteId, ...data }
  const { data: row, error } = id
    ? await supabase.from('site_segmentos_ensino').update(data).eq('id', id).select().single()
    : await supabase.from('site_segmentos_ensino').insert(payload).select().single()
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
  return row
}

export async function deleteSegmentoInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_segmentos_ensino').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── FAQ (mesmo padrão do dentista-joao) ──────────────────────────
export interface FaqData { pergunta?: string; resposta?: string }

export async function upsertFaqInlineCE(siteId: string, id: string | null, data: FaqData) {
  const supabase = await createClient()
  const payload = { site_id: siteId, ...data }
  const { data: row, error } = id
    ? await supabase.from('site_faq').update(data).eq('id', id).select().single()
    : await supabase.from('site_faq').insert(payload).select().single()
  if (error) throw new Error(error.message)
  revalidateAll()
  return row
}

export async function deleteFaqInlineCE(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_faq').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Blog/Artigos — reaproveita BlogEditor genérico (components/app) ─
const ARTIGO_CAMPOS = ['slug', 'titulo', 'resumo', 'conteudo', 'capa_url', 'alt_text', 'meta_titulo', 'meta_descricao', 'imagem_og', 'ordem', 'publicado']

async function upsertGenerico(tabela: string, campos: string[], _prev: PEFormState, formData: FormData): Promise<PEFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  if (!siteId) return { error: 'site_id ausente.' }

  const payload: Record<string, string | number | boolean | null> = { site_id: siteId }
  for (const campo of campos) {
    const valor = formData.get(campo)
    if (campo === 'ordem') payload[campo] = valor ? parseInt(valor as string, 10) : 0
    else if (campo === 'publicado') payload[campo] = formData.get('publicado') === 'on'
    else payload[campo] = (valor as string)?.trim() || null
  }
  if (!payload.titulo) return { error: 'Preencha o título.' }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from(tabela).update(payload).eq('id', id)
    : await supabase.from(tabela).insert(payload)
  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidateAll()
  return { success: true }
}

async function deleteGenerico(tabela: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(tabela).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

export async function upsertArtigoCE(prev: PEFormState, fd: FormData) { return upsertGenerico('site_blog_posts', ARTIGO_CAMPOS, prev, fd) }
export async function deleteArtigoCE(id: string) { return deleteGenerico('site_blog_posts', id) }
