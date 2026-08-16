import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Formato interno único dos posts de Instagram — TODO o frontend
 * consome só isso. A fonte hoje é o Behold (behold.so), mas se um
 * dia trocarmos (API própria da Meta, feed manual em tabela), só a
 * normalização muda; componentes ficam intactos.
 */
export type InstagramPost = {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  /** URL da imagem a exibir (pra vídeo, é a thumbnail) */
  imageUrl: string
  /** URL do MP4 — só quando mediaType === 'VIDEO' */
  videoUrl: string | null
  permalink: string
  caption: string
  timestamp: string
  username: string
}

type RegistroBruto = Record<string, unknown>

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

/**
 * Normaliza o JSON do Behold pro nosso formato interno.
 *
 * Defensivo de propósito: o Behold retorna { username, posts: [...] }
 * com campos camelCase (mediaType, mediaUrl, thumbnailUrl, permalink,
 * caption, timestamp) — mas aceitamos também snake_case (formato cru
 * da Graph API) pra não quebrar se o shape variar entre versões de
 * feed. Campo ausente vira string vazia, nunca undefined no JSONB.
 */
export function normalizarPostsBehold(json: unknown): InstagramPost[] {
  if (!json || typeof json !== 'object') return []

  const raiz = json as RegistroBruto
  const lista: unknown = Array.isArray(json) ? json : (raiz.posts ?? raiz.data ?? [])
  if (!Array.isArray(lista)) return []

  const usernameConta = str(raiz.username)

  return lista
    .filter((p): p is RegistroBruto => !!p && typeof p === 'object')
    .map((p) => {
      const mediaTypeBruto = str(p.mediaType ?? p.media_type).toUpperCase()
      const mediaType: InstagramPost['mediaType'] =
        mediaTypeBruto === 'VIDEO' ? 'VIDEO'
        : mediaTypeBruto === 'CAROUSEL_ALBUM' ? 'CAROUSEL_ALBUM'
        : 'IMAGE'

      const mediaUrl = str(p.mediaUrl ?? p.media_url)
      const thumbnailUrl = str(p.thumbnailUrl ?? p.thumbnail_url)
      // pegadinha herdada da Graph API: thumbnail só existe em vídeo;
      // pra imagem, a própria mediaUrl é a imagem
      const imageUrl = mediaType === 'VIDEO' ? (thumbnailUrl || mediaUrl) : (mediaUrl || thumbnailUrl)

      return {
        id: str(p.id) || str(p.permalink),
        mediaType,
        imageUrl,
        videoUrl: mediaType === 'VIDEO' ? (mediaUrl || null) : null,
        permalink: str(p.permalink),
        caption: str(p.caption ?? p.prunedCaption),
        timestamp: str(p.timestamp),
        username: str(p.username) || usernameConta,
      }
    })
    .filter((p) => p.imageUrl !== '' && p.permalink !== '')
}

/**
 * Lê os posts cacheados do feed de um site. Server-only (admin
 * client) — a tabela tem RLS sem policies de propósito.
 * Retorna [] em qualquer cenário de ausência/erro: a seção de
 * Instagram simplesmente não renderiza, a página nunca quebra.
 */
export async function getInstagramPosts(chave: string, limite = 8): Promise<InstagramPost[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('instagram_feeds')
      .select('posts')
      .eq('chave', chave)
      .eq('ativo', true)
      .maybeSingle()

    if (error || !data || !Array.isArray(data.posts)) return []
    return (data.posts as InstagramPost[]).slice(0, limite)
  } catch {
    return []
  }
}
