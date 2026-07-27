'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PEFormState {
  error?: string
  success?: boolean
}

// ── Configurações gerais do site ────────────────────────────────
export async function atualizarConfig(_prev: PEFormState, formData: FormData): Promise<PEFormState> {
  const siteId = formData.get('site_id') as string
  const payload = {
    business_name: (formData.get('business_name') as string)?.trim(),
    tagline: (formData.get('tagline') as string)?.trim() || null,
    hero_title: (formData.get('hero_title') as string)?.trim() || null,
    hero_sub: (formData.get('hero_sub') as string)?.trim() || null,
    hero_imagem_url: (formData.get('hero_imagem_url') as string)?.trim() || null,
    telefone: (formData.get('telefone') as string)?.trim() || null,
    whatsapp: (formData.get('whatsapp') as string)?.trim() || null,
    instagram_handle: (formData.get('instagram_handle') as string)?.trim() || null,
    endereco: (formData.get('endereco') as string)?.trim() || null,
    status: formData.get('status') as string,
  }
  if (!payload.business_name) return { error: 'Nome do negócio é obrigatório.' }
  if (payload.status !== 'rascunho' && payload.status !== 'publicado') return { error: 'Status inválido.' }

  const supabase = await createClient()
  const { error } = await supabase.from('sites').update(payload).eq('id', siteId)
  if (error) return { error: error.message }

  revalidatePath('/app/projeto-especial/config')
  revalidatePath('/projetos-especiais/dentista-joao', 'layout')
  return { success: true }
}

// ── genérico: upsert/delete por tabela (mesmo formato pros 4 CRUDs
//    de conteúdo com slug: tratamentos, cursos-e-eventos; e os sem
//    slug: equipe) ───────────────────────────────────────────────

async function upsertGenerico(
  tabela: string,
  campos: string[],
  _prev: PEFormState,
  formData: FormData
): Promise<PEFormState> {
  const id = formData.get('id') as string | null
  const siteId = formData.get('site_id') as string
  if (!siteId) return { error: 'site_id ausente.' }

  const payload: Record<string, string | number | boolean | null> = { site_id: siteId }
  for (const campo of campos) {
    const valor = formData.get(campo)
    if (campo === 'ordem') {
      payload[campo] = valor ? parseInt(valor as string, 10) : 0
    } else if (campo === 'publicado') {
      payload[campo] = formData.get('publicado') === 'on'
    } else {
      payload[campo] = (valor as string)?.trim() || null
    }
  }
  if (!payload.titulo && !payload.nome) return { error: 'Preencha o título/nome.' }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from(tabela).update(payload).eq('id', id)
    : await supabase.from(tabela).insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath(`/app/projeto-especial/${tabela === 'site_cursos_eventos' ? 'cursos-e-eventos' : tabela.replace('site_', '')}`)
  revalidatePath('/projetos-especiais/dentista-joao', 'layout')
  return { success: true }
}

async function deleteGenerico(tabela: string, id: string, revalidatePathName: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(tabela).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/app/projeto-especial/${revalidatePathName}`)
  revalidatePath('/projetos-especiais/dentista-joao', 'layout')
}

const TRATAMENTO_CAMPOS = ['slug', 'titulo', 'descricao_curta', 'descricao_completa', 'imagem_url', 'alt_text', 'meta_titulo', 'meta_descricao', 'imagem_og', 'ordem', 'publicado']
export async function upsertTratamento(prev: PEFormState, fd: FormData) { return upsertGenerico('site_tratamentos', TRATAMENTO_CAMPOS, prev, fd) }
export async function deleteTratamento(id: string) { return deleteGenerico('site_tratamentos', id, 'tratamentos') }

const EQUIPE_CAMPOS = ['nome', 'foto_url', 'alt_text', 'formacao', 'especialidade', 'bio', 'ordem']
export async function upsertEquipe(prev: PEFormState, fd: FormData) { return upsertGenerico('site_equipe', EQUIPE_CAMPOS, prev, fd) }
export async function deleteEquipe(id: string) { return deleteGenerico('site_equipe', id, 'equipe') }

const CURSO_CAMPOS = ['slug', 'titulo', 'descricao', 'data_evento', 'imagem_url', 'alt_text', 'meta_titulo', 'meta_descricao', 'imagem_og', 'ordem', 'publicado']
export async function upsertCursoEvento(prev: PEFormState, fd: FormData) { return upsertGenerico('site_cursos_eventos', CURSO_CAMPOS, prev, fd) }
export async function deleteCursoEvento(id: string) { return deleteGenerico('site_cursos_eventos', id, 'cursos-e-eventos') }

const FAQ_CAMPOS = ['pergunta', 'resposta', 'categoria', 'ordem']
export async function upsertFaqItem(prev: PEFormState, fd: FormData) { return upsertGenerico('site_faq', FAQ_CAMPOS, prev, fd) }
export async function deleteFaqItem(id: string) { return deleteGenerico('site_faq', id, 'faq') }

const ARTIGO_CAMPOS = ['slug', 'titulo', 'resumo', 'conteudo', 'capa_url', 'alt_text', 'meta_titulo', 'meta_descricao', 'imagem_og', 'ordem', 'publicado']
export async function upsertArtigo(prev: PEFormState, fd: FormData) { return upsertGenerico('site_blog_posts', ARTIGO_CAMPOS, prev, fd) }
export async function deleteArtigo(id: string) { return deleteGenerico('site_blog_posts', id, 'artigos') }
