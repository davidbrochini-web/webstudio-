'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PEFormState {
  error?: string
  success?: boolean
}

// ── genérico: usado só pelo Blog/Artigos (a única tela que ainda é
//    form-based — as demais seções do projeto especial viraram o
//    live editor em /app/projeto-especial/editor, com upsert inline
//    por campo em vez de formulário completo) ────────────────────
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
  if (!payload.titulo) return { error: 'Preencha o título.' }

  const supabase = await createClient()
  const { error } = id
    ? await supabase.from(tabela).update(payload).eq('id', id)
    : await supabase.from(tabela).insert(payload)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  revalidatePath('/app/projeto-especial/blog')
  revalidatePath('/projetos-especiais/dentista-joao', 'layout')
  return { success: true }
}

async function deleteGenerico(tabela: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(tabela).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/app/projeto-especial/blog')
  revalidatePath('/projetos-especiais/dentista-joao', 'layout')
}

const ARTIGO_CAMPOS = ['slug', 'titulo', 'resumo', 'conteudo', 'capa_url', 'alt_text', 'meta_titulo', 'meta_descricao', 'imagem_og', 'ordem', 'publicado']
export async function upsertArtigo(prev: PEFormState, fd: FormData) { return upsertGenerico('site_blog_posts', ARTIGO_CAMPOS, prev, fd) }
export async function deleteArtigo(id: string) { return deleteGenerico('site_blog_posts', id) }
