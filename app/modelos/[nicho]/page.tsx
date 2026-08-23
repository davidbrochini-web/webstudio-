import { niches, getNiche } from '@/lib/templates'
import { SEO_NICHOS } from '@/lib/seo-nichos'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { layoutByArchetype } from '@/lib/layout-map'

export function generateStaticParams() {
  return niches.map(n => ({ nicho: n.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ nicho: string }> }
): Promise<Metadata> {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) return {}
  const seo = SEO_NICHOS[nicho]
  if (!seo) {
    // Nicho sem conteúdo de SEO dedicado ainda — mantém fora do índice
    // até ganhar o próprio (página de demo pura não deve rankear).
    return {
      // `absolute`: mesmo motivo do bloco abaixo — evita duplicar
      // "| omnidesign" quando o template do layout raiz é aplicado.
      title: { absolute: `${config.label} — modelo de site | omnidesign` },
      description: config.heroSub,
      robots: { index: false },
    }
  }
  return {
    // `absolute` ignora o template '%s | Omnidesign' do layout raiz —
    // tituloSeo já vem com o sufixo de marca embutido (ver
    // lib/seo-nichos.ts), sem isso duplicava "| Omnidesign" no
    // <title> (bug achado em produção 23/08).
    title: { absolute: seo.tituloSeo },
    description: seo.descricaoSeo,
    alternates: { canonical: `/modelos/${nicho}` },
    openGraph: {
      title: seo.tituloSeo,
      description: seo.descricaoSeo,
      type: 'website',
    },
  }
}

export default async function NichePreview(
  { params }: { params: Promise<{ nicho: string }> }
) {
  const { nicho } = await params
  const config = getNiche(nicho)
  if (!config) notFound()

  const seo = SEO_NICHOS[nicho]
  const LayoutComponent = layoutByArchetype[config.pageLayout]

  const faqJsonLd = seo
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seo.faq.map(f => ({
          '@type': 'Question',
          name: f.pergunta,
          acceptedAnswer: { '@type': 'Answer', text: f.resposta },
        })),
      }
    : null

  return (
    <div className="min-h-screen">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Barra de preview da agência — única coisa compartilhada entre os arquétipos */}
      <div className="sticky top-0 z-50 bg-black text-white px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="text-xs font-bold text-[var(--brand-bright)] flex-shrink-0 hover:underline">
            omnidesign
          </Link>
          <span className="text-xs text-white/50 truncate hidden sm:inline">
            — modelo: {config.label}. Esse site pode ser seu.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/#contato"
            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg grad-bg hover:opacity-90 hover:scale-105 transition-all whitespace-nowrap"
          >
            ✨ Peça uma demo
          </Link>
        </div>
      </div>

      {/* Faixa de contexto pra quem chega do Google — compacta de
          propósito: apresenta e manda direto pra demo ao vivo, que é
          o diferencial de verdade da página. */}
      {seo && (
        <div className="bg-white border-b border-gray-200 px-6 py-6 text-center">
          <h1 className="font-bold text-xl sm:text-2xl text-gray-900 mb-1.5">{seo.h1}</h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            {seo.intro} <span className="whitespace-nowrap">↓</span>
          </p>
        </div>
      )}

      {/* Página do nicho — estrutura, ordem de seções e componentes totalmente próprios */}
      <LayoutComponent config={config} />

      {/* FAQ do nicho — fecha a página respondendo o que quem buscou
          "site para [nicho]" quer saber, com o CTA logo depois. */}
      {seo && (
        <section className="bg-white border-t border-gray-200 px-6 py-14">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-bold text-xl text-gray-900 text-center mb-8">
              Perguntas frequentes sobre {seo.h1.toLowerCase()}
            </h2>
            <div className="flex flex-col gap-5">
              {seo.faq.map(f => (
                <div key={f.pergunta} className="border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-base text-gray-900 mb-2">{f.pergunta}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.resposta}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl grad-bg text-white font-semibold text-base hover:opacity-90 transition-all"
              >
                📩 Entre em contato
              </Link>
              <p className="text-xs text-gray-400 mt-3">
                Gostou do modelo? A gente adapta com o conteúdo do seu negócio.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
