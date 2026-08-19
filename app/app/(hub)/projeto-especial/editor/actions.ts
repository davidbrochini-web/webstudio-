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
  'business_name', 'tagline', 'hero_title', 'hero_sub', 'hero_imagem_url', 'logo_url',
  'telefone', 'whatsapp', 'instagram_handle', 'endereco', 'status',
  'missao', 'visao', 'valores', 'logo_posicao',
] as const
type SiteField = typeof ALLOWED_SITE_FIELDS[number]

export async function updateSiteFieldPE(siteId: string, field: SiteField, value: string) {
  if (!ALLOWED_SITE_FIELDS.includes(field)) throw new Error('Campo inválido.')
  const supabase = await createClient()
  // whatsapp precisa ficar só com dígitos (usado direto em wa.me/{numero});
  // telefone mantém a formatação como o cliente digitou (é só exibido, nunca
  // usado como link cru — o link tel: já limpa na hora de renderizar)
  let cleanValue = field === 'whatsapp' ? value.replace(/\D/g, '') : value

  if (field === 'logo_posicao' && !['esquerda', 'centro'].includes(value)) {
    throw new Error('Posição inválida.')
  }

  // instagram_handle vira link (instagram.com/{handle}) — validar formato
  // pra não deixar salvar algo tipo o nome completo do cliente por engano
  // (já aconteceu: "DR JOÃO VICTOR PIMENTA" acabou indo pra esse campo).
  if (field === 'instagram_handle' && cleanValue.trim() !== '') {
    cleanValue = cleanValue.trim().replace(/^@/, '')
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanValue)) {
      throw new Error('Usuário do Instagram inválido — use só o @usuario (sem espaços), ex: joaovictor.odonto')
    }
  }

  const { error } = await supabase.from('sites').update({ [field]: cleanValue }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Textos customizados (qualquer heading/subtítulo hardcoded do site,
// sem precisar de coluna nova por campo — ver lib/textos-customizados.ts)
export async function updateTextoCustomizado(siteId: string, chave: string, valor: string) {
  if (!chave || !/^[a-z0-9_]+$/.test(chave)) throw new Error('Chave de texto inválida.')
  const supabase = await createClient()
  const { data: atual, error: fetchError } = await supabase
    .from('sites').select('textos_customizados').eq('id', siteId).single()
  if (fetchError) throw new Error(fetchError.message)

  const novo = { ...(atual?.textos_customizados ?? {}), [chave]: valor }
  const { error } = await supabase.from('sites').update({ textos_customizados: novo }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Instagram: visível/oculto, independente do handle estar preenchido
// (pedido: o cliente liga/desliga o ícone quando quiser, sem precisar
// apagar o link cadastrado)
export async function updateInstagramVisivel(siteId: string, visivel: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ instagram_visivel: visivel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Cores customizadas (item pedido pelo cliente: paleta do site
// seguindo a paleta do logo) ────────────────────────────────────
export async function updateCores(siteId: string, corPrimaria: string, corSecundaria: string) {
  const hex = /^#[0-9a-fA-F]{6}$/
  if (!hex.test(corPrimaria) || !hex.test(corSecundaria)) throw new Error('Cor inválida — use o formato #RRGGBB.')
  const supabase = await createClient()
  const { error } = await supabase.from('sites')
    .update({ cor_primaria: corPrimaria, cor_secundaria: corSecundaria }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Visibilidade por seção (oculta do menu/Home/página sem apagar
// o conteúdo — pedido: dar tempo de alimentar uma área aos poucos
// sem ela ficar exposta no site) ────────────────────────────────
const SECOES_TOGGLE = [
  'secao_tratamentos_visivel', 'secao_cursos_visivel', 'secao_equipe_visivel',
  'secao_faq_visivel', 'secao_artigos_visivel', 'secao_depoimentos_visivel',
] as const
type SecaoToggle = typeof SECOES_TOGGLE[number]

export async function toggleSecaoVisivel(siteId: string, campo: SecaoToggle, visivel: boolean) {
  if (!SECOES_TOGGLE.includes(campo)) throw new Error('Seção inválida.')
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ [campo]: visivel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Tratamentos ──────────────────────────────────────────────────
export interface TratamentoData {
  titulo: string; slug: string; descricao_curta: string; descricao_completa: string
  beneficios: string | null; duracao: string | null; indicado_para: string | null
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null
  publicado: boolean
}

const TRATAMENTO_SELECT = 'id, titulo, slug, descricao_curta, descricao_completa, beneficios, duracao, indicado_para, imagem_url, alt_text, meta_titulo, meta_descricao, publicado'

export async function upsertTratamentoInline(siteId: string, id: string | null, data: Partial<TratamentoData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_tratamentos').update(data).eq('id', id)
      .select(TRATAMENTO_SELECT).single()
    if (error) throw new Error(friendlyError(error))
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_tratamentos').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_tratamentos')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, publicado: true, descricao_curta: '', descricao_completa: '', ...data })
    .select(TRATAMENTO_SELECT).single()
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

// ── Depoimentos ──────────────────────────────────────────────────
export interface DepoimentoData {
  nome: string; cargo_ou_contexto: string | null; texto: string
  nota: number; foto_url: string | null; alt_text: string | null; publicado: boolean
}

export async function upsertDepoimentoInline(siteId: string, id: string | null, data: Partial<DepoimentoData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_depoimentos').update(data).eq('id', id)
      .select('id, nome, cargo_ou_contexto, texto, nota, foto_url, alt_text, publicado').single()
    if (error) throw new Error(error.message)
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_depoimentos').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_depoimentos')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, nome: 'Nome do paciente', texto: 'Depoimento do paciente', ...data })
    .select('id, nome, cargo_ou_contexto, texto, nota, foto_url, alt_text, publicado').single()
  if (error) throw new Error(error.message)
  revalidateAll()
  return row
}

export async function deleteDepoimentoInline(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('site_depoimentos').update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidateAll()
}

// ── Cursos e Eventos ─────────────────────────────────────────────
export interface CursoData {
  titulo: string; slug: string; descricao: string; descricao_completa: string | null; data_evento: string | null
  imagem_url: string | null; alt_text: string | null
  meta_titulo: string | null; meta_descricao: string | null; publicado: boolean
}

const CURSO_SELECT = 'id, titulo, slug, descricao, descricao_completa, data_evento, imagem_url, alt_text, meta_titulo, meta_descricao, publicado'

export async function upsertCursoInline(siteId: string, id: string | null, data: Partial<CursoData>) {
  const supabase = await createClient()
  if (id) {
    const { data: row, error } = await supabase.from('site_cursos_eventos').update(data).eq('id', id)
      .select(CURSO_SELECT).single()
    if (error) throw new Error(friendlyError(error))
    revalidateAll()
    return row
  }
  const { data: max } = await supabase.from('site_cursos_eventos').select('ordem').eq('site_id', siteId).order('ordem', { ascending: false }).limit(1).maybeSingle()
  const { data: row, error } = await supabase.from('site_cursos_eventos')
    .insert({ site_id: siteId, ordem: (max?.ordem ?? -1) + 1, publicado: true, descricao: '', ...data })
    .select(CURSO_SELECT).single()
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

// ── SEO (E15-ish, aba SEO do painel) ──────────────────────────────
export async function toggleSeoIndexavel(siteId: string, indexavel: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ seo_indexavel: indexavel }).eq('id', siteId)
  if (error) throw new Error(error.message)
  revalidateAll()
  revalidatePath('/app/projeto-especial/seo')
}
