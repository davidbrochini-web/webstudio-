import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Notícias',
    description: 'Fique por dentro das novidades e eventos do Colégio Elite.',
    alternates: { canonical: `${SITE_URL_BASE}/noticias` },
  }
}

const FALLBACK = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=60'

export default async function NoticiasPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const { data: artigos } = await supabase
    .from('site_blog_posts')
    .select('slug, titulo, resumo, capa_url')
    .eq('site_id', site.id).eq('publicado', true).is('deleted_at', null).order('created_at', { ascending: false })

  return (
    <PageShell site={site}>
      <PageBanner title="Notícias" imageUrl={site.hero_imagem_url} base={base} />

      <section className="px-5 sm:px-6 py-16 max-w-5xl mx-auto">
        {!artigos?.length ? (
          <p className="text-center text-slate-400 text-sm">Nenhuma notícia publicada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {artigos.map((a, i) => (
              <Reveal key={a.slug} delay={i * 70}>
                <Link href={`${base}/noticias/${a.slug}`} className="group block rounded-2xl overflow-hidden shadow-lg bg-white h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.capa_url || FALLBACK} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="font-display font-bold text-[var(--ce-secondary)] mb-1.5 text-sm leading-snug">{a.titulo}</p>
                    <p className="text-xs text-slate-500 leading-snug">{a.resumo}</p>
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
