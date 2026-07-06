import Link from 'next/link'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

function PhoneMockup() {
  return (
    <div className="animate-float w-[148px] flex-shrink-0 bg-[#18182a] rounded-[24px] p-1.5 shadow-[0_28px_56px_rgba(0,0,0,.30),0_0_0_1px_rgba(255,255,255,.06)]">
      <div className="bg-white rounded-[19px] overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-gray-100">
          <div className="w-5 h-5 rounded-full grad-bg flex-shrink-0" />
          <span className="text-[9px] font-semibold text-gray-800">meunegocio</span>
        </div>
        <div className="w-full aspect-square bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-2xl">🍕</div>
        <div className="px-2.5 py-2">
          <p className="text-[9px] font-semibold text-gray-800">❤️ 142 curtidas</p>
          <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">Novidade no cardápio! Vem conhecer 🔥</p>
        </div>
      </div>
    </div>
  )
}

function SyncDots() {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <span className="text-[8px] font-bold text-[var(--purple)] bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">automático</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full grad-bg animate-travel" />
        <div className="w-1.5 h-1.5 rounded-full grad-bg animate-travel-2" />
        <div className="w-1.5 h-1.5 rounded-full grad-bg animate-travel-3" />
      </div>
    </div>
  )
}

function BrowserMockup() {
  return (
    <div className="animate-float-delay w-[200px] flex-shrink-0 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-[0_28px_56px_rgba(124,58,237,.1)]">
      <div className="bg-[var(--off)] px-2.5 py-1.5 flex items-center gap-1.5 border-b border-[var(--border)]">
        <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"/>)}</div>
        <div className="flex-1 bg-white border border-[var(--border)] rounded px-1.5 py-0.5 text-[7px] text-[var(--muted)]">meunegocio.com.br</div>
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)]">
          <span className="text-[9px] font-bold grad-text">Meu Negócio</span>
          <div className="flex gap-1.5"><span className="text-[7px] text-[var(--muted)]">Menu</span><span className="text-[7px] text-[var(--muted)]">Contato</span></div>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          <div className="aspect-square rounded-[3px] bg-gradient-to-br from-[#667eea] to-[#764ba2] animate-pop relative"><span className="absolute top-0.5 right-0.5 text-[6px] text-white/80">✦</span></div>
          <div className="aspect-square rounded-[3px] bg-gradient-to-br from-[#f6d365] to-[#fda085]"/>
          <div className="aspect-square rounded-[3px] bg-gradient-to-br from-[#a8edea] to-[#fed6e3]"/>
          <div className="aspect-square rounded-[3px] bg-gradient-to-br from-[#5ee7df] to-[#b490ca]"/>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="w-1 h-1 rounded-full bg-[var(--green)] animate-blink"/>
          <span className="text-[7px] font-semibold text-[var(--green)]">Sincronizado agora</span>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-10 lg:pt-20 lg:pb-16">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--purple)] bg-purple-50 px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink)] animate-blink"/>
            Site + sistemas para pequenos e médios negócios
          </div>
          <h1 className="font-display font-extrabold text-[clamp(32px,8vw,56px)] leading-[1.08] text-[var(--dark)] mb-5">
            Seu negócio organizado.<br />
            <span className="grad-text">Do site ao estoque.</span>
          </h1>
          <p className="text-base lg:text-lg text-[var(--muted)] leading-relaxed mb-8 max-w-[480px] mx-auto lg:mx-0">
            Criamos sites conectados ao Instagram e sistemas internos para quem
            precisa de tecnologia que funciona — sem complicação, sem depender
            de TI para cada detalhe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-base hover:bg-[#22c55e] transition-all hover:-translate-y-px shadow-lg shadow-green-200">
              💬 Falar com a gente
            </a>
            <Link href="#modulos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border)] text-[var(--slate)] font-semibold text-base hover:border-[var(--slate)] transition-colors">
              Ver os módulos →
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="lg:hidden flex justify-center pt-2"><PhoneMockup /></div>
          <div className="hidden lg:flex items-center gap-4"><PhoneMockup /><SyncDots /><BrowserMockup /></div>
        </div>
      </div>
    </section>
  )
}
