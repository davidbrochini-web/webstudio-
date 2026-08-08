import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Ensino',
    description: 'Conheça os segmentos de ensino do Colégio Elite: Ensino Bilíngue, Fundamental e Médio.',
    alternates: { canonical: `${SITE_URL_BASE}/ensino` },
  }
}

const FALLBACK = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=60'

export default async function EnsinoPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const { data: segmentos } = await supabase
    .from('site_segmentos_ensino')
    .select('slug, titulo, resumo, imagem_url')
    .eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('ordem')

  return (
    <PageShell site={site}>
      <PageBanner title="Ensino" imageUrl={site.hero_imagem_url} base={base} />

      <section className="px-5 sm:px-6 py-16 max-w-5xl mx-auto">
        {!segmentos?.length ? (
          <p className="text-center text-slate-400 text-sm">Conteúdo em breve.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {segmentos.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <Link href={`${base}/ensino/${s.slug}`} className="group block rounded-2xl overflow-hidden shadow-lg bg-white h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imagem_url || FALLBACK} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="font-display font-bold text-[var(--ce-secondary)] mb-1.5">{s.titulo}</p>
                    <p className="text-sm text-slate-500 leading-snug">{s.resumo}</p>
                    <p className="text-xs font-bold text-[var(--ce-primary)] mt-3">Saiba mais →</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
