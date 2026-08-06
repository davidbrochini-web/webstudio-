import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import SecaoOcultaAviso from '@/components/dentista-joao/SecaoOcultaAviso'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Artigos',
    description: 'Artigos e novidades sobre saúde bucal, tratamentos odontológicos e cuidados com o sorriso.',
    alternates: { canonical: `${SITE_URL_BASE}/artigos` },
  }
}

export default async function ArtigosPage() {
  const site = await getSiteEspecial()

  if (!site.secao_artigos_visivel) {
    return (
      <PageShell site={site}>
        <PageBanner title="Artigos" imageUrl={site.hero_imagem_url} />
        <SecaoOcultaAviso />
      </PageShell>
    )
  }
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('site_blog_posts')
    .select('slug, titulo, resumo, capa_url')
    .eq('site_id', site.id)
    .eq('publicado', true)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <PageBanner title="Artigos" imageUrl={site.hero_imagem_url} />
      <section className="px-6 py-16 max-w-5xl mx-auto">
        {!posts?.length ? (
          <p className="text-slate-500">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map(p => (
              <Link key={p.slug} href={`/projetos-especiais/dentista-joao/artigos/${p.slug}`} className="block group">
                {p.capa_url && <img src={p.capa_url} alt="" className="w-full aspect-[16/10] object-cover rounded-2xl mb-4" />}
                <h2 className="font-display font-bold text-base text-[var(--dj-secondary)] mb-1.5 leading-snug">{p.titulo}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{p.resumo}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
