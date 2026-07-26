import Link from 'next/link'
import { modules, formatPreco } from '@/lib/modules'

export default function Modules() {
  // "Site" é o produto base (não é módulo à parte) — a grade aqui
  // mostra só os módulos internos de fato contratáveis.
  const internos = modules.filter(m => m.slug !== 'site')

  return (
    <section id="modulos" className="py-20 px-6 bg-[var(--dark)]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand2)] mb-3">
              Sistemas internos
            </p>
            <h2 className="font-display font-extrabold text-[clamp(26px,5vw,40px)] leading-tight text-white mb-3">
              Módulos para quem tem negócio<br className="hidden sm:block" /> pra tocar.
            </h2>
            <p className="text-base text-white/40 leading-relaxed max-w-xl">
              Cada módulo tem seu próprio preço, de acordo com a complexidade —
              você contrata só o que precisa e adiciona o restante conforme a
              operação crescer.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <span className="font-display font-extrabold text-2xl grad-text">R$&thinsp;39,90</span>
              <span className="text-sm text-white/40">a R$&thinsp;99,90/módulo/mês</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {internos.map(({ slug, icon, label, desc, preco, disponivel }) => (
            <div
              key={slug}
              className="bg-[var(--dark)] hover:bg-white/[0.04] transition-colors p-7 flex flex-col gap-3 relative"
            >
              <span className={`absolute top-5 right-5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                disponivel
                  ? 'text-white bg-[var(--brand)]'
                  : 'text-[var(--brand)] bg-green-950/60 border border-green-800/40'
              }`}>
                {disponivel ? 'Disponível' : 'Em breve'}
              </span>
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">{label}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
              {preco != null && (
                <p className="mt-auto pt-3 border-t border-white/5">
                  <span className="font-display font-extrabold text-lg text-white">R$&thinsp;{formatPreco(preco)}</span>
                  <span className="text-xs text-white/40">/mês</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA de teste — só o que está disponível hoje dá pra testar */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl grad-bg text-white text-sm font-bold hover:opacity-90 hover:scale-105 transition-all"
          >
            ✨ Teste os módulos você mesmo
          </Link>
          <p className="text-center text-sm text-white/25">
            Todos os módulos rodam na web — sem instalação, acessível de qualquer dispositivo.
          </p>
        </div>
      </div>
    </section>
  )
}
