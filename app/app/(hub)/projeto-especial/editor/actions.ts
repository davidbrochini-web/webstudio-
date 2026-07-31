'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PATH = '/app/projeto-especial/editor'
const SITE_PATH = '/projetos-especiais/dentista-joao'

function revalidateAll() {
  revalidatePath(PATH)
  revalidatePath(SITE_PATH, 'layout')
}

/** Traduz o erro cru do Postgres pra algo que o cliente entenda —
 *  em especial a violação de unique(site_id, slug), que aparece toda
 *  vez que ele digita um slug já usado por outro item da mesma seção. */
function friendlyError(error: { message: string; code?: string }): string {
  if (error.code === '23505' || error.message.includes('duplicate key')) {
    return 'Esse endereço de URL já está em uso por outro item. Escolha outro.'
  }
  return error.message
}

// ── Campos diretos da tabela sites ──────────────────────────────
const ALLOWED_SITE_FIELDS = [
  'business_name', 'tagline', 'hero_title', 'hero_sub', 'hero_imagem_url',
  'telefone', 'whatsapp', 'instagram_handle', 'endereco', 'status',
  'missao', 'visao', 'valores',
] as const
type SiteField = typeof ALLOWED_SITE_FIELDS[number]

export async function updateSiteFieldPE(siteId: string, field: SiteField, value: string) {
  if (!ALLOWED_SITE_FIELDS.includes(field)) throw new Error('Campo inválido.')
  const supabase = await createClient()
  // whatsapp precisa ficar só com dígitos (usado direto em wa.me/{numero});
  // telefone mantém a formatação como o cliente digitou (é só exibido, nunca
  // usado como link cru — o link tel: já limpa na hora de renderizar)
  const cleanValue = field === 'whatsapp' ? value.replace(/\D/g, '') : value
  const { error } = await supabase.from('sites').update({ [field]: cleanValue }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Tratamentos ──────────────────────────────────────────────────
export interface TratamentoData {
  titulo: string; slug: string; descricao_curta: string; descricao_completa: string
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null
  publicado: boolean
}

export async function upsertTratamentoInline(siteId: string, id: string | null, data: Partial<TratamentoData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_tratamentos').update(data).eq('id', id)
      .select('id, titulo, slug, descricao_curta, descricao_completa, imagem_url, alt_text, meta_titulo, meta_descricao, publicado').single()
    if (error) throw new Error(friendlyError(error))
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_tratamentos').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_tratamentos')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, publicado: true, descricao_curta: '', descricao_completa: '', ...data })
    .select('id, titulo, slug, descricao_curta, descricao_completa, imagem_url, alt_text, meta_titulo, meta_descricao, publicado').single()
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
  return row
}

export async function deleteTratamentoInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_tratamentos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
}

// ── Equipe ───────────────────────────────────────────────────────
export interface EquipeData {
  nome: string; foto_url: string | null; alt_text: string | null
  formacao: string | null; especialidade: string | null; bio: string | null
}

export async function upsertEquipeInline(siteId: string, id: string | null, data: Partial<EquipeData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_equipe').update(data).eq('id', id)
      .select('id, nome, foto_url, alt_text, formacao, especialidade, bio').single()
    if (error) throw new Error(error.message)
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_equipe').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_equipe')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, nome: 'Novo profissional', ...data })
    .select('id, nome, foto_url, alt_text, formacao, especialidade, bio').single()
  if (error) throw new Error(error.message)
  revalidateAll()
  return row
}

export async function deleteEquipeInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_equipe').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Cursos e Eventos ─────────────────────────────────────────────
export interface CursoData {
  titulo: string; slug: string; descricao: string; data_evento: string | null
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null; publicado: boolean
}

export async function upsertCursoInline(siteId: string, id: string | null, data: Partial<CursoData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_cursos_eventos').update(data).eq('id', id)
      .select('id, titulo, slug, descricao, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, publicado').single()
    if (error) throw new Error(friendlyError(error))
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_cursos_eventos').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_cursos_eventos')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, publicado: true, descricao: '', ...data })
    .select('id, titulo, slug, descricao, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, publicado').single()
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
  return row
}

export async function deleteCursoInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_cursos_eventos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(friendlyError(error))
  revalidateAll()
}

// ── FAQ ──────────────────────────────────────────────────────────
export interface FaqData { pergunta: string; resposta: string; categoria: string | null }

export async function upsertFaqInline(siteId: string, id: string | null, data: Partial<FaqData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_faq').update(data).eq('id', id)
      .select('id, pergunta, resposta, categoria').single()
    if (error) throw new Error(error.message)
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_faq').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_faq')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, resposta: '', ...data })
    .select('id, pergunta, resposta, categoria').single()
  if (error) throw new Error(error.message)
  revalidateAll()
  return row
}

export async function deleteFaqInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_faq').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}
