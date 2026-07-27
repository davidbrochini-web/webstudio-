import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `A Clínica — ${site.business_name}`, robots: { index: false } }
}

export default async function AClinicaPage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from('site_fotos')
    .select('url')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  return (
    <PageShell site={site}>
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-6">A Clínica</h1>
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
          {site.tagline || 'Texto institucional a definir no levantamento com o cliente.'}
        </p>
        {site.endereco && (
          <p className="text-sm text-slate-500 mt-6">
            📍 {site.endereco}
          </p>
        )}
      </section>

      {!!fotos?.length && (
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fotos.map(f => (
              <img key={f.url} src={f.url} alt="" className="w-full aspect-square object-cover rounded-2xl" />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
