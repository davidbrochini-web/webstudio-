import type { NichePost } from '@/lib/templates'
import { unsplashPhotoFrom } from '@/lib/photos'

interface Props {
  posts: NichePost[]
  igHandle: string
  businessName: string
  accent: string
  photoIds: string[]
}

export default function InstagramFeedStrip({ posts, igHandle, businessName, accent, photoIds }: Props) {
  return (
    <section className="bg-[var(--off)] border-y border-[var(--border)] py-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {businessName[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ink)] leading-tight">{igHandle}</p>
            <p className="text-xs text-[var(--muted)]">Atualizado direto do Instagram</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-blink" />
          <span className="text-xs font-semibold text-[var(--green)] hidden sm:inline">Sincronizado agora</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-6 pb-2 justify-start lg:justify-center" style={{ minWidth: 'min-content' }}>
          {posts.map(({ likes, caption }, i) => (
            <div
              key={caption}
              className="relative flex-shrink-0 w-[180px] sm:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--border)] group cursor-default"
            >
              {i === 0 && (
                <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                  ✦ novo
                </span>
              )}
              <img
                src={unsplashPhotoFrom(photoIds, i, 440, 550)}
                alt={caption}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10">
                <p className="text-white text-xs font-bold mb-0.5">❤️ {likes} curtidas</p>
                <p className="text-white/85 text-[11px] leading-tight">{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-[var(--muted)] mt-5 px-6">
        No site real, cada post do feed vem direto do seu Instagram — aqui é uma amostra.
      </p>
    </section>
  )
}
