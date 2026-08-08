import type { Metadata } from 'next'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'
import { texto } from '@/lib/textos-customizados'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: 'Proposta Pedagógica',
    description: site.tagline || `Conheça a proposta pedagógica do ${site.business_name}: missão, visão e valores.`,
    alternates: { canonical: `${SITE_URL_BASE}/proposta-pedagogica` },
  }
}

export default async function PropostaPedagogicaPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()

  return (
    <PageShell site={site}>
      <PageBanner title="Proposta Pedagógica" imageUrl={site.hero_imagem_url} base={base} />

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-primary)] mb-3">
            {texto(site.textos_customizados, 'proposta_eyebrow', 'Sobre nós.')}
          </p>
          <p className="text-slate-700 leading-relaxed">
            {site.tagline || 'O Colégio Elite propõe uma educação renovada e inovadora, adaptada aos novos tempos, estabelecendo o aluno como protagonista na aprendizagem.'}
          </p>
        </Reveal>
      </section>

      {(site.missao || site.visao || site.valores) && (
        <section className="px-6 py-14 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { titulo: texto(site.textos_customizados, 'proposta_missao_titulo', 'Missão'), conteudo: site.missao, tipo: 'texto' as const },
              { titulo: texto(site.textos_customizados, 'proposta_visao_titulo', 'Visão'), conteudo: site.visao, tipo: 'texto' as const },
              { titulo: texto(site.textos_customizados, 'proposta_valores_titulo', 'Valores'), conteudo: site.valores, tipo: 'lista' as const },
            ].filter(c => c.conteudo).map((card, i) => (
              <Reveal key={card.titulo} delay={i * 100}>
                <div className="bg-white border-l-4 border-[var(--ce-primary)] rounded-r-2xl p-6 shadow-sm h-full">
                  <h3 className="font-display font-bold text-base text-[var(--ce-secondary)] mb-3">{card.titulo}</h3>
                  {card.tipo === 'lista' ? (
                    <ul className="text-sm text-slate-600 leading-relaxed flex flex-col gap-1.5">
                      {card.conteudo!.split('\n').map(v => v.trim()).filter(Boolean).map(v => <li key={v}>• {v}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{card.conteudo}&rdquo;</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
