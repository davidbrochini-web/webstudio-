import { unsplashPhoto } from '@/lib/photos'

// Mostra uma foto real de cada nicho que atendemos — vitrine dos segmentos
const posts = [
  { likes: 210, caption: 'Matrículas abertas',       photoId: '1519406596751-0a3ccc4937fe' }, // escola
  { likes: 98,  caption: 'Bastidores do estúdio',    photoId: '1502920917128-1aa500764cbd' }, // fotografia
  { likes: 87,  caption: 'Sorriso renovado',         photoId: '1704455306251-b4634215d98f' }, // odontológica
  { likes: 156, caption: 'Agenda da semana',         photoId: '1503951914875-452162b0f3f1' }, // barbearia
  { likes: 133, caption: 'Treino do dia',            photoId: '1689877020200-403d8542d95d' }, // academia
  { likes: 94,  caption: 'Sessão de relaxamento',    photoId: '1770573319185-049b29ab0ca9' }, // massagem
  { likes: 76,  caption: 'Consulta essa semana',     photoId: '1521587760476-6c12a4b040da' }, // advocacia
]

export default function FeedDemo() {
  return (
    <section id="demo" className="py-20 bg-white border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">
            Veja funcionando
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            O Instagram, direto no site.
          </h2>
          <p className="text-base text-[var(--muted)] max-w-lg mx-auto">
            É assim que fica no site do seu negócio: cada post novo aparece
            automaticamente, sem você levantar um dedo.
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full grad-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              w
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--dark)] leading-tight">@webstudio</p>
              <p className="text-xs text-[var(--muted)]">Instagram conectado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-blink" />
            <span className="text-xs font-semibold text-[var(--green)] hidden sm:inline">Sincronizado agora</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-6 pb-2 justify-start lg:justify-center" style={{ minWidth: 'min-content' }}>
          {posts.map(({ likes, caption, photoId }, i) => (
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
                src={unsplashPhoto(photoId, 440, 550)}
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
        Arraste para o lado — funciona igual no site do seu negócio.
      </p>
    </section>
  )
}
