import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Artigos — ${site.business_name}`, robots: { index: false } }
}

export default async function ArtigosPage() {
  const site = await getSiteEspecial()
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
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-10">Artigos</h1>
        {!posts?.length ? (
          <p className="text-slate-500">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map(p => (
              <Link key={p.slug} href={`/projetos-especiais/dentista-joao/artigos/${p.slug}`} className="block group">
                {p.capa_url && <img src={p.capa_url} alt="" className="w-full aspect-[16/10] object-cover rounded-2xl mb-4" />}
                <h2 className="font-display font-bold text-base text-[#0B2B3C] mb-1.5 leading-snug">{p.titulo}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{p.resumo}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
