import type { Metadata } from 'next'
import { getSiteEspecial, getBasePath, getCtaPrincipal } from '@/lib/localdesk'
import Header from '@/components/localdesk/Header'
import Footer from '@/components/localdesk/Footer'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça a LocalDesk — suporte técnico direto, sem venda de peça, remoto ou a domicílio.',
}

export default async function SobrePage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const cta = getCtaPrincipal(site, base)

  const valoresLista = (site.valores ?? '').split('\n').map(v => v.trim()).filter(Boolean)

  return (
    <>
      <Header base={base} cta={cta} />

      <section className="ld-container pt-14 pb-16">
        <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)] mb-6">Sobre a LocalDesk</h1>
        <p className="ld-measure text-lg text-[var(--muted)] leading-relaxed">{site.missao}</p>
      </section>

      <section className="bg-[var(--bg-sunken)] py-16">
        <div className="ld-container grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--blue)] mb-2">O que buscamos</p>
            <p className="text-[var(--ink)] leading-relaxed">{site.visao}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--blue)] mb-2">Como trabalhamos</p>
            <div className="flex flex-col gap-2">
              {valoresLista.map(v => (
                <div key={v} className="flex items-center gap-2 text-[var(--ink)]">
                  <span className="ld-status-dot flex-shrink-0" />
                  <span className="text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ld-container py-20 text-center">
        <h2 className="font-bold text-2xl text-[var(--ink)] mb-3">Alguma dúvida?</h2>
        <p className="text-[var(--muted)] mb-6">Chama a gente, sem compromisso.</p>
        <a
          href={cta.href}
          {...(cta.externo ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})}
          className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-white bg-[var(--green)] px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          {cta.label}
        </a>
      </section>

      <Footer site={site} base={base} />
    </>
  )
}
