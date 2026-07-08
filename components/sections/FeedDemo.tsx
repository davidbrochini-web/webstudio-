const posts = [
  { emoji: '🍕', bg: 'from-[#667eea] to-[#764ba2]', likes: 142, caption: 'Novidade no cardápio!' },
  { emoji: '📸', bg: 'from-[#f6d365] to-[#fda085]', likes: 98,  caption: 'Bastidores do estúdio' },
  { emoji: '🦷', bg: 'from-[#a8edea] to-[#fed6e3]', likes: 87,  caption: 'Sorriso renovado' },
  { emoji: '🎓', bg: 'from-[#5ee7df] to-[#b490ca]', likes: 210, caption: 'Matrículas abertas' },
  { emoji: '💈', bg: 'from-[#f093fb] to-[#f5576c]', likes: 156, caption: 'Agenda da semana' },
  { emoji: '🏋️', bg: 'from-[#4facfe] to-[#00f2fe]', likes: 133, caption: 'Treino do dia' },
  { emoji: '💆', bg: 'from-[#a1c4fd] to-[#c2e9fb]', likes: 94,  caption: 'Sessão de relaxamento' },
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

        {/* Barra de status conectado */}
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

      {/* Feed horizontal — escapa do max-width, ponta a ponta */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-6 pb-2" style={{ width: 'max-content' }}>
          {posts.map(({ emoji, bg, likes, caption }, i) => (
            <div
              key={caption}
              className={`relative flex-shrink-0 w-[180px] sm:w-[220px] aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br ${bg} group cursor-default`}
            >
              {i === 0 && (
                <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">
                  ✦ novo
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl">
                {emoji}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
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
