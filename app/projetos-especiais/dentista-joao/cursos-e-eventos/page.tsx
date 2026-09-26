import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import SecaoOcultaAviso from '@/components/dentista-joao/SecaoOcultaAviso'
import { ogPagina, tituloLegivel } from '@/lib/dentista-joao-seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  const description = 'Confira os próximos cursos, palestras e eventos sobre saúde bucal promovidos pela clínica.'
  return {
    title: 'Cursos e Eventos',
    description,
    alternates: { canonical: `${SITE_URL_BASE}/cursos-e-eventos` },
    ...ogPagina(site, { path: '/cursos-e-eventos', titulo: `Cursos e Eventos — ${site.business_name}`, descricao: description }),
  }
}

export default async function CursosEventosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()

  if (!site.secao_cursos_visivel) {
    return (
      <PageShell site={site}>
        <PageBanner title="Cursos e Eventos" imageUrl={site.hero_imagem_url} base={base} />
        <SecaoOcultaAviso />
      </PageShell>
    )
  }
  const supabase = await createClient()

  const { data: itens } = await supabase
    .from('site_cursos_eventos')
    .select('slug, titulo, descricao, data_evento, imagem_url')
    .eq('site_id', site.id)
    .eq('publicado', true)
    .is('deleted_at', null)
    .order('data_evento', { ascending: true })

  return (
    <PageShell site={site}>
      <PageBanner title="Cursos e Eventos" imageUrl={site.hero_imagem_url} base={base} />
      <section className="px-6 py-16 max-w-5xl mx-auto">
        {!itens?.length ? (
          <p className="text-slate-500">Nenhum curso ou evento publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {itens.map(c => (
              <Link key={c.slug} href={`${base}/cursos-e-eventos/${c.slug}`} className="block group border border-slate-100 rounded-2xl overflow-hidden hover:border-[var(--dj-primary)] transition-colors">
                {c.imagem_url && <Image src={c.imagem_url} alt={c.titulo} width={640} height={480} sizes="(min-width: 640px) 33vw, 100vw" className="w-full aspect-[4/3] object-cover" />}
                <div className="p-5">
                  {c.data_evento && (
                    <p className="text-xs font-bold text-[var(--dj-primary)] mb-1.5">
                      {new Date(c.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <h2 className="font-display font-bold text-base text-[var(--dj-secondary)] mb-1.5">{c.titulo}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{c.descricao}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
