import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Cursos e Eventos — ${site.business_name}`, robots: { index: site.status === 'publicado' } }
}

export default async function CursosEventosPage() {
  const site = await getSiteEspecial()
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
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-10">Cursos e Eventos</h1>
        {!itens?.length ? (
          <p className="text-slate-500">Nenhum curso ou evento publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {itens.map(c => (
              <Link key={c.slug} href={`/projetos-especiais/dentista-joao/cursos-e-eventos/${c.slug}`} className="block group border border-slate-100 rounded-2xl overflow-hidden hover:border-[#0EA5A0] transition-colors">
                {c.imagem_url && <img src={c.imagem_url} alt="" className="w-full aspect-[4/3] object-cover" />}
                <div className="p-5">
                  {c.data_evento && (
                    <p className="text-xs font-bold text-[#0EA5A0] mb-1.5">
                      {new Date(c.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <h2 className="font-display font-bold text-base text-[#0B2B3C] mb-1.5">{c.titulo}</h2>
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
