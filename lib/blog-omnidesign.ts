import { createClient } from '@/lib/supabase/server'
import type { BlogPostOmnidesign } from '@/lib/blog-omnidesign-shared'

export type { BlogPostOmnidesign } from '@/lib/blog-omnidesign-shared'
export { slugify, statusExibicao } from '@/lib/blog-omnidesign-shared'

/** Listagem pública — só o que já passou pelo filtro de publicado + data (RLS já garante, isso é só ordenação). */
export async function listarPostsPublicados(): Promise<BlogPostOmnidesign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts_omnidesign')
    .select('*')
    .order('publicado_em', { ascending: false })
  return (data ?? []) as BlogPostOmnidesign[]
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
