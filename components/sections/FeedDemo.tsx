const posts = [
  { emoji: '🍕', bg: 'from-[#667eea] to-[#764ba2]', likes: 142, caption: 'Novidade no cardápio!', isNew: true },
  { emoji: '📸', bg: 'from-[#f6d365] to-[#fda085]', likes: 98,  caption: 'Bastidores do estúdio' },
  { emoji: '🦷', bg: 'from-[#a8edea] to-[#fed6e3]', likes: 87,  caption: 'Sorriso renovado' },
  { emoji: '🎓', bg: 'from-[#5ee7df] to-[#b490ca]', likes: 210, caption: 'Matrículas abertas' },
  { emoji: '💈', bg: 'from-[#f093fb] to-[#f5576c]', likes: 156, caption: 'Agenda da semana' },
  { emoji: '🏋️', bg: 'from-[#4facfe] to-[#00f2fe]', likes: 133, caption: 'Treino do dia' },
]

export default function FeedDemo() {
  return (
    <section id="demo" className="py-20 px-6 bg-white border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--purple)] mb-3">
            Veja funcionando
          </p>
          <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-[var(--dark)] mb-3">
            O feed do Instagram, direto no site.
          </h2>
          <p className="text-base text-[var(--muted)] max-w-lg mx-auto">
            É assim que fica no site do seu negócio: cada post novo aparece
            automaticamente, sem você levantar um dedo.
          </p>
        </div>

        {/* Feed simulado */}
        <div className="max-w-3xl mx-auto">

          {/* Barra de status "conectado" */}
          <div className="flex items-center justify-between bg-[var(--off)] border border-[var(--border)] rounded-t-2xl px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full grad-bg flex items-center justify-center text-white text-sm font-bold">
                w
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--dark)] leading-tight">@webstudio</p>
                <p className="text-xs text-[var(--muted)]">Instagram conectado</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-blink" />
              <span className="text-xs font-semibold text-[var(--green)]">Sincronizado agora</span>
            </div>
          </div>

          {/* Grid de posts */}
          <div className="grid grid-cols-3 gap-1 border-x border-[var(--border)] bg-white p-1">
            {posts.map(({ emoji, bg, likes, caption, isNew }) => (
              <div
                key={caption}
                className={`relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br ${bg} group cursor-default`}
              >
                {isNew && (
                  <span className="absolute top-2 left-2 z-10 text-[9px] font-bold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                    ✦ novo
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl">
                  {emoji}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-sm font-bold">❤️ {likes}</span>
                  <span className="text-white/80 text-xs px-3 text-center">{caption}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do feed */}
          <div className="bg-[var(--off)] border border-[var(--border)] rounded-b-2xl px-5 py-3 text-center">
            <p className="text-xs text-[var(--muted)]">
              Atualização automática a cada publicação — posts, fotos e reels.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
