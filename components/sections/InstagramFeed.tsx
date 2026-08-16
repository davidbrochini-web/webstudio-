import type { InstagramPost } from '@/lib/instagram'

/**
 * Seção de feed do Instagram — compartilhada por todos os sites
 * (Omnidesign + Projetos Especiais + tenants), mesmo princípio do
 * GoogleAnalytics: UM componente, nunca duplicar por projeto.
 *
 * Server component puro: recebe os posts já lidos do cache
 * (lib/instagram.ts → getInstagramPosts). Se a lista vier vazia
 * (feed não conectado, erro, conta sem posts), a seção inteira
 * não renderiza — a página nunca quebra nem mostra área vazia.
 *
 * Mobile-first: scroll horizontal com snap (1 card e meio visível
 * no mobile, ~4 no desktop), sem lib de carrossel e sem JS no client.
 * Vídeo não é embedado: thumbnail + ícone de play, clique abre o
 * post no Instagram (evita baixar MP4 na home).
 */
export default function InstagramFeed({
  posts,
  handle,
  titulo = 'Acompanhe no Instagram',
  subtitulo,
}: {
  posts: InstagramPost[]
  /** handle SEM @ — usado no CTA "Seguir @handle" */
  handle?: string
  titulo?: string
  subtitulo?: string
}) {
  if (!posts || posts.length === 0) return null

  const username = handle || posts[0].username
  const perfilUrl = username ? `https://www.instagram.com/${username}/` : null

  return (
    <section id="instagram" className="py-20 px-6 bg-[var(--off)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">
            Instagram
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--ink)] mb-3">
            {titulo}
          </h2>
          {subtitulo && (
            <p className="text-base text-[var(--muted)] max-w-lg mx-auto">{subtitulo}</p>
          )}
        </div>

        {/* Scroll horizontal com snap — sem carrossel JS */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-thin">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="group relative flex-none w-[70%] sm:w-[45%] lg:w-[23.5%] snap-start bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.caption ? post.caption.slice(0, 100) : 'Post do Instagram'}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {post.mediaType === 'VIDEO' && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center group-hover:bg-black/70 transition-colors">
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}

                {post.mediaType === 'CAROUSEL_ALBUM' && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                      <rect x="3" y="3" width="13" height="13" rx="2" />
                      <path d="M8 21h11a2 2 0 0 0 2-2V8" />
                    </svg>
                  </span>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-3 left-3 right-3 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                  {post.caption}
                </span>
              </div>
            </a>
          ))}
        </div>

        {perfilUrl && (
          <div className="text-center mt-8">
            <a
              href={perfilUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Seguir @{username}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
