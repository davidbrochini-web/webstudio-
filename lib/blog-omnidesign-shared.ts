export interface BlogPostOmnidesign {
  id: string
  slug: string
  titulo: string
  resumo: string
  conteudo: string
  categoria: string | null
  capa_url: string | null
  capa_alt: string | null
  status: 'rascunho' | 'publicado'
  publicado_em: string | null
  meta_titulo: string | null
  meta_descricao: string | null
  created_at: string
  updated_at: string
}

/** Slug a partir do título — mesma lógica usada nos outros CRUDs de conteúdo. */
export function slugify(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** "Publicado", "Agendado — 20/08/2026" ou "Rascunho" — estado computado, nunca salvo. */
export function statusExibicao(post: Pick<BlogPostOmnidesign, 'status' | 'publicado_em'>): string {
  if (post.status !== 'publicado') return 'Rascunho'
  if (!post.publicado_em) return 'Rascunho'
  const data = new Date(post.publicado_em)
  if (data.getTime() > Date.now()) {
    return `Agendado — ${data.toLocaleDateString('pt-BR')}`
  }
  return 'Publicado'
}
