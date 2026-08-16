import LeadFormOmnidesign from './LeadFormOmnidesign'

export default function CtaFinal() {
  return (
    <section id="contato" className="grad-bg py-20 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-white mb-4">
          Seu negócio merece um site que trabalha por você.
        </h2>
        <p className="text-base text-white/70 leading-relaxed mb-9">
          A gente resolve tudo em 48 horas.<br className="hidden sm:block" />
          Preencha o formulário abaixo que entraremos em contato o mais rápido possível.
        </p>
        <LeadFormOmnidesign />
      </div>
    </section>
  )
}
