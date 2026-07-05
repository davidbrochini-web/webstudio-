const WA_LINK = 'https://wa.me/55XXXXXXXXXXX'

export default function CtaFinal() {
  return (
    <section id="contato" className="grad-bg py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-white mb-4">
          Seu negócio merece um site que trabalha por você.
        </h2>
        <p className="text-base text-white/70 leading-relaxed mb-9">
          A gente resolve tudo em 48 horas.<br className="hidden sm:block" />
          Você só precisa chamar no WhatsApp.
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[var(--purple)] font-bold text-base hover:-translate-y-px hover:shadow-xl hover:shadow-black/10 transition-all"
        >
          💬 Chamar no WhatsApp agora
        </a>
      </div>
    </section>
  )
}
