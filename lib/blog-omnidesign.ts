import { createClient } from '@/lib/supabase/server'
import type { BlogPostOmnidesign } from '@/lib/blog-omnidesign-shared'

export type { BlogPostOmnidesign } from '@/lib/blog-omnidesign-shared'
export { slugify, statusExibicao } from '@/lib/blog-omnidesign-shared'

export interface BlogPostResumo {
  id: string
  slug: string
  titulo: string
  resumo: string
  categoria: string | null
  capa_url: string | null
  capa_alt: string | null
  publicado_em: string | null
  updated_at: string
}

/**
 * Listagem pública — só o que já passou pelo filtro de publicado +
 * data (RLS já garante, isso é só ordenação). Busca só as colunas que
 * a página /blog e o sitemap realmente usam — NUNCA select('*') aqui:
 * conteudo é o texto inteiro do artigo (alguns já passam de 4.000
 * caracteres) e baixar isso pra cada um dos posts só pra listar
 * título+resumo deixava a página visivelmente mais lenta à toa.
 */
export async function listarPostsPublicados(): Promise<BlogPostResumo[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts_omnidesign')
    .select('id, slug, titulo, resumo, categoria, capa_url, capa_alt, publicado_em, updated_at')
    .order('publicado_em', { ascending: false })
  return (data ?? []) as BlogPostResumo[]
}

export async function buscarPostPorSlug(slug: string): Promise<BlogPostOmnidesign | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts_omnidesign')
    .select('*')
    .eq('slug', slug)
    .single()
  return (data as BlogPostOmnidesign) ?? null
}

/** Pro admin — vê tudo (rascunho, agendado, publicado), RLS libera por is_super_admin(). */
export async function listarPostsAdmin(): Promise<BlogPostOmnidesign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts_omnidesign')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data ?? []) as BlogPostOmnidesign[]
}

export async function buscarPostPorId(id: string): Promise<BlogPostOmnidesign | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts_omnidesign')
    .select('*')
    .eq('id', id)
    .single()
  return (data as BlogPostOmnidesign) ?? null
}
