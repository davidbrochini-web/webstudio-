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
      {/* Banner de página — mesmo padrão do site de referência: título
          sobre uma faixa com foto de fundo desfocada. */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        {site.hero_imagem_url && (
          <img src={site.hero_imagem_url} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm scale-110" />
        )}
        <div className="absolute inset-0 bg-[#0B2B3C]/80" />
        <h1 className="relative font-display font-extrabold text-3xl sm:text-4xl text-white">A Clínica</h1>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-2">Sobre nós</p>
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
