import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Equipe — ${site.business_name}`, robots: { index: false } }
}

export default async function EquipePage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: equipe } = await supabase
    .from('site_equipe')
    .select('nome, foto_url, alt_text, formacao, especialidade, bio')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <PageBanner title="Equipe" imageUrl={site.hero_imagem_url} />
      <section className="px-6 py-16 max-w-5xl mx-auto">
        {!equipe?.length ? (
          <p className="text-slate-500">Equipe a cadastrar.</p>
        ) : (
          <div className="flex flex-col gap-12">
            {equipe.map(p => (
              <div key={p.nome} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.alt_text || p.nome} className="w-40 h-40 rounded-full object-cover mx-auto sm:mx-0" />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-slate-100 mx-auto sm:mx-0 flex items-center justify-center text-4xl text-slate-300">👤</div>
                )}
                <div className="text-center sm:text-left">
                  <h2 className="font-display font-bold text-xl text-[#0B2B3C]">{p.nome}</h2>
                  {p.especialidade && <p className="text-sm text-[#0EA5A0] font-semibold mt-0.5">{p.especialidade}</p>}
                  {p.formacao && <p className="text-sm text-slate-500 mt-1">{p.formacao}</p>}
                  {p.bio && <p className="text-sm text-slate-600 leading-relaxed mt-3">{p.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
