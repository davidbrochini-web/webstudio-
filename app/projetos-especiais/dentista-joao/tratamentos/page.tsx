import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import SecaoOcultaAviso from '@/components/dentista-joao/SecaoOcultaAviso'
import Reveal from '@/components/dentista-joao/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: 'Tratamentos' }
}

export default async function TratamentosPage() {
  const site = await getSiteEspecial()

  if (!site.secao_tratamentos_visivel) {
    return (
      <PageShell site={site}>
        <PageBanner title="Tratamentos" imageUrl={site.hero_imagem_url} />
        <SecaoOcultaAviso />
      </PageShell>
    )
  }
  const supabase = await createClient()

  const { data: tratamentos } = await supabase
    .from('site_tratamentos')
    .select('slug, titulo, descricao_curta, descricao_completa, imagem_url, alt_text')
    .eq('site_id', site.id)
    .eq('publicado', true)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <PageBanner title="Tratamentos" imageUrl={site.hero_imagem_url} />

      {/* Introdução */}
      <section className="px-6 py-10 text-center max-w-2xl mx-auto">
        <Reveal>
          <p className="text-slate-500 leading-relaxed">
            Trabalhamos com inovação, dedicação e tecnologia para garantir o melhor tratamento aos nossos pacientes.
          </p>
        </Reveal>
      </section>

      {/* Tratamentos — layout alternado (par=imagem à esquerda, ímpar=imagem à direita) */}
      {!tratamentos?.length ? (
        <p className="text-center text-slate-500 pb-16">Nenhum tratamento publicado ainda.</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {tratamentos.map((t, i) => {
            const imgLeft = i % 2 === 0
            return (
              <section key={t.slug} className="px-6 py-14 max-w-5xl mx-auto w-full">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${!imgLeft ? 'md:flex md:flex-row-reverse' : ''}`}>
                  {/* Imagem com hover zoom */}
                  <Reveal delay={0} className="overflow-hidden rounded-2xl shadow-md">
                    {t.imagem_url ? (
                      <img
                        src={t.imagem_url}
                        alt={t.alt_text || t.titulo}
                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300 text-4xl">🦷</div>
                    )}
                  </Reveal>

                  {/* Texto */}
                  <Reveal delay={150}>
                    <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] mb-4">
                      {t.titulo}
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-3">{t.descricao_curta}</p>
                    {t.descricao_completa && t.descricao_completa !== t.descricao_curta && (
                      <p className="text-slate-500 leading-relaxed text-sm mb-6">{t.descricao_completa}</p>
                    )}
                    <Link
                      href={`/projetos-especiais/dentista-joao/tratamentos/${t.slug}`}
                      className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
                    >
                      Saiba Mais
                    </Link>
                  </Reveal>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
