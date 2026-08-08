import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Estrutura',
    description: 'Conheça a estrutura e os diferenciais do Colégio Elite: laboratórios, salas multimídia, espaço natureza e mais.',
    alternates: { canonical: `${SITE_URL_BASE}/estrutura` },
  }
}

export default async function EstruturaPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const [{ data: diferenciais }, { data: fotos }] = await Promise.all([
    supabase.from('site_diferenciais').select('icone, titulo, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_fotos').select('url').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
  ])

  return (
    <PageShell site={site}>
      <PageBanner title="Estrutura" imageUrl={site.hero_imagem_url} base={base} />

      <section className="px-5 sm:px-6 py-16 max-w-5xl mx-auto">
        {!diferenciais?.length ? (
          <p className="text-center text-slate-400 text-sm">Conteúdo em breve.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {diferenciais.map((d, i) => (
              <Reveal key={d.titulo} delay={i * 70}>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-full flex gap-4">
                  <span className="text-3xl flex-shrink-0">{d.icone}</span>
                  <div>
                    <h3 className="font-display font-bold text-[var(--ce-secondary)] mb-1.5">{d.titulo}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{d.texto}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {!!fotos?.length && (
        <section className="px-5 sm:px-6 pb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fotos.map((f, i) => (
              <Reveal key={f.url} delay={i * 60}>
                <div className="overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
