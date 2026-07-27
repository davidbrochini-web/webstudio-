import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Tratamentos — ${site.business_name}`, robots: { index: false } }
}

export default async function TratamentosPage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: tratamentos } = await supabase
    .from('site_tratamentos')
    .select('slug, titulo, descricao_curta, imagem_url')
    .eq('site_id', site.id)
    .eq('publicado', true)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <PageBanner title="Tratamentos" imageUrl={site.hero_imagem_url} />
      <section className="px-6 py-16 max-w-5xl mx-auto">
        {!tratamentos?.length ? (
          <p className="text-slate-500">Nenhum tratamento publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tratamentos.map(t => (
              <Link key={t.slug} href={`/projetos-especiais/dentista-joao/tratamentos/${t.slug}`} className="block group border border-slate-100 rounded-2xl overflow-hidden hover:border-[#0EA5A0] transition-colors">
                {t.imagem_url && <img src={t.imagem_url} alt="" className="w-full aspect-[4/3] object-cover" />}
                <div className="p-5">
                  <h2 className="font-display font-bold text-base text-[#0B2B3C] mb-1.5">{t.titulo}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">{t.descricao_curta}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
