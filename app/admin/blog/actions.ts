'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { slugify } from '@/lib/blog-omnidesign'
import { revalidatePath } from 'next/cache'

export interface BlogFormState {
  error?: string
  success?: boolean
  id?: string
}

interface BlogPostInput {
  titulo: string
  slug?: string
  resumo: string
  conteudo: string
  categoria?: string
  capa_url?: string
  status: 'rascunho' | 'publicado'
  publicado_em?: string | null
  meta_titulo?: string
  meta_descricao?: string
}

function revalidarBlog(slug?: string) {
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)
}

export async function criarPost(input: BlogPostInput): Promise<BlogFormState> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.titulo)
  if (!slug) return { error: 'Título inválido — não gerou um slug utilizável.' }

  const { data: user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('blog_posts_omnidesign')
    .insert({
      titulo: input.titulo,
      slug,
      resumo: input.resumo,
      conteudo: input.conteudo,
      categoria: input.categoria || null,
      capa_url: input.capa_url || null,
      status: input.status,
      publicado_em: input.publicado_em || null,
      meta_titulo: input.meta_titulo || null,
      meta_descricao: input.meta_descricao || null,
      created_by: user.user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Já existe um post com esse slug.' }
    return { error: error.message }
  }

  revalidarBlog(slug)
  return { success: true, id: data.id }
}

export async function atualizarPost(id: string, input: BlogPostInput): Promise<BlogFormState> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.titulo)
  if (!slug) return { error: 'Título inválido — não gerou um slug utilizável.' }

  const { error } = await supabase
    .from('blog_posts_omnidesign')
    .update({
      titulo: input.titulo,
      slug,
      resumo: input.resumo,
      conteudo: input.conteudo,
      categoria: input.categoria || null,
      capa_url: input.capa_url || null,
      status: input.status,
      publicado_em: input.publicado_em || null,
      meta_titulo: input.meta_titulo || null,
      meta_descricao: input.meta_descricao || null,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Já existe um post com esse slug.' }
    return { error: error.message }
  }

  revalidarBlog(slug)
  return { success: true, id }
}

export async function apagarPost(id: string): Promise<BlogFormState> {
  await requireSuperAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('blog_posts_omnidesign')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidarBlog()
  return { success: true }
}
