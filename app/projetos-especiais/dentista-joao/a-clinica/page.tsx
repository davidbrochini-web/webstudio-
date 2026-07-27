import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'

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

  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null

  return (
    <PageShell site={site}>
      <PageBanner title="A Clínica" imageUrl={site.hero_imagem_url} />

      {/* Sobre nós */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-2">Sobre nós</h2>
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
          {site.tagline || 'Texto institucional a definir no levantamento com o cliente.'}
        </p>
      </section>

      {/* Galeria */}
      {!!fotos?.length && (
        <section className="px-6 pb-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fotos.map(f => (
              <img key={f.url} src={f.url} alt="" className="w-full aspect-square object-cover rounded-2xl" />
            ))}
          </div>
        </section>
      )}

      {/* Missão / Visão / Valores */}
      <section className="px-6 py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="font-display font-bold text-base text-[#0EA5A0] mb-3">Valores</h3>
            <ul className="text-sm text-slate-600 leading-relaxed flex flex-col gap-1.5">
              <li>• Profissionalismo</li>
              <li>• Humanismo</li>
              <li>• Ética</li>
              <li>• Conhecimento</li>
              <li>• Comprometimento</li>
            </ul>
            <p className="text-xs text-slate-400 mt-3">(Exemplo — a confirmar no levantamento)</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="font-display font-bold text-base text-[#0EA5A0] mb-3">Missão</h3>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              &ldquo;Ser uma clínica que proporciona atendimento de excelência e alta resolutividade para nossos pacientes.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-3">(Exemplo — a confirmar no levantamento)</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="font-display font-bold text-base text-[#0EA5A0] mb-3">Visão</h3>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              &ldquo;Ser reconhecida como uma clínica de referência na qualidade do atendimento e tratamento realizado.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-3">(Exemplo — a confirmar no levantamento)</p>
          </div>
        </div>
      </section>

      {/* Localização + Mapa */}
      {site.endereco && (
        <section className="px-6 py-14 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display font-bold text-xl text-[#0B2B3C] mb-3">Localização</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {site.endereco}
            </p>
            {site.telefone && <p className="text-sm text-slate-500">📞 {site.telefone}</p>}
          </div>
          {mapsQuery && (
            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <iframe
                title="Localização da clínica"
                src={`https://maps.google.com/maps?q=${mapsQuery}&t=m&z=15&output=embed&iwloc=near`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </section>
      )}
    </PageShell>
  )
}
