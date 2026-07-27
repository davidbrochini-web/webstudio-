import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Equipe — ${site.business_name}`, robots: { index: site.status === 'publicado' } }
}

export default async function EquipePage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: equipe } = await supabase
    .from('site_equipe')
    .select('nome, foto_url, alt_text, formacao, especialidade')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-10">Equipe</h1>
        {!equipe?.length ? (
          <p className="text-slate-500">Equipe a cadastrar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {equipe.map(p => (
              <div key={p.nome} className="text-center">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.alt_text || p.nome} className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-100 mx-auto mb-4 flex items-center justify-center text-3xl text-slate-300">👤</div>
                )}
                <h2 className="font-display font-bold text-base text-[#0B2B3C]">{p.nome}</h2>
                {p.especialidade && <p className="text-sm text-[#0EA5A0] font-semibold">{p.especialidade}</p>}
                {p.formacao && <p className="text-sm text-slate-500 mt-1">{p.formacao}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  )
}
