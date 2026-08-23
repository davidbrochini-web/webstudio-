import { SEO_SOLUCOES } from '@/lib/seo-solucoes'
import { getModule, formatPreco } from '@/lib/modules'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export function generateStaticParams() {
  return Object.keys(SEO_SOLUCOES).map(problema => ({ problema }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ problema: string }> }
): Promise<Metadata> {
  const { problema } = await params
  const solucao = SEO_SOLUCOES[problema]
  if (!solucao) return {}
  return {
    title: solucao.tituloSeo,
    description: solucao.descricaoSeo,
    alternates: { canonical: `/solucoes/${problema}` },
    openGraph: {
      title: solucao.tituloSeo,
      description: solucao.descricaoSeo,
      type: 'website',
      url: `https://omnidesign.com.br/solucoes/${problema}`,
    },
  }
}

export default async function SolucaoPage(
  { params }: { params: Promise<{ problema: string }> }
) {
  const { problema } = await params
  const solucao = SEO_SOLUCOES[problema]
  if (!solucao) notFound()

  const modulo = getModule(solucao.moduloSlug)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: solucao.faq.map(f => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        {modulo && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[var(--brand2)] mb-3">
            {modulo.icon} {modulo.label}
          </span>
        )}
        <h1 className="font-display font-extrabold text-[clamp(28px,5.5vw,44px)] leading-tight text-[var(--ink)] mb-5">
          {solucao.h1}
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl mb-12">
          {solucao.dor}
        </p>

        <div className="flex flex-col gap-5 mb-14">
          {solucao.comoResolve.map(item => (
            <div key={item.titulo} className="flex gap-4 items-start border border-[var(--border)] rounded-2xl p-5">
              <span className="text-[var(--brand)] text-lg leading-none mt-0.5 flex-shrink-0">✓</span>
              <div>
                <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1">{item.titulo}</h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {modulo && modulo.preco != null && (
          <div className="rounded-2xl grad-bg p-8 text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-white/80 mb-2">
              {modulo.label}
            </p>
            <p className="text-3xl font-display font-extrabold text-white mb-1">
              a partir de R$ {formatPreco(modulo.preco)}<span className="text-base font-semibold">/mês</span>
            </p>
            <p className="text-sm text-white/80 mb-6">Sem taxa de criação separada, sem fidelidade.</p>
            <Link
              href="/#contato"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--brand)] font-bold text-base hover:opacity-90 transition-all"
            >
              📩 Entre em contato
            </Link>
          </div>
        )}

        <section>
          <h2 className="font-display font-bold text-xl text-[var(--ink)] mb-8">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {solucao.faq.map(f => (
              <details key={f.pergunta} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="font-display font-bold text-base text-[var(--ink)]">{f.pergunta}</span>
                  <span className="text-xl text-[var(--muted)] group-open:rotate-45 transition-transform flex-shrink-0">+</span>
                </summary>
                <p className="text-sm text-[var(--muted)] leading-relaxed mt-3 max-w-2xl">{f.resposta}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
