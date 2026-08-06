import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, SITE_URL_BASE } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import Reveal from '@/components/dentista-joao/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return {
    title: 'A Clínica',
    description: site.tagline || `Conheça a ${site.business_name}: nossa missão, valores e a estrutura pensada pra cuidar do seu sorriso.`,
    alternates: { canonical: `${SITE_URL_BASE}/a-clinica` },
  }
}

export default async function AClinicaPage() {
  const site = await getSiteEspecial()
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from('site_fotos').select('url')
    .eq('site_id', site.id).is('deleted_at', null).order('ordem')

  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null

  return (
    <PageShell site={site}>
      <PageBanner title="A Clínica" imageUrl={site.hero_imagem_url} />

      {/* Sobre nós */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--dj-primary)] mb-3">Sobre nós.</p>
          <p className="text-slate-700 font-semibold leading-relaxed">
            {site.tagline || 'Texto institucional a definir no levantamento com o cliente.'}
          </p>
        </Reveal>
      </section>

      {/* Galeria */}
      {!!fotos?.length && (
        <section className="px-6 pb-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fotos.map((f, i) => (
              <Reveal key={f.url} delay={i * 60}>
                <div className="overflow-hidden rounded-2xl">
                  <img src={f.url} alt="" className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Missão / Visão / Valores — editáveis pelo cliente no painel */}
      {(site.missao || site.visao || site.valores) && (
        <section className="px-6 py-14 bg-slate-50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { titulo: 'Missão', conteudo: site.missao, tipo: 'texto' as const },
              { titulo: 'Visão', conteudo: site.visao, tipo: 'texto' as const },
              { titulo: 'Valores', conteudo: site.valores, tipo: 'lista' as const },
            ].filter(c => c.conteudo).map((card, i) => (
              <Reveal key={card.titulo} delay={i * 100}>
                <div className="bg-white border-l-4 border-[var(--dj-primary)] rounded-r-2xl p-6 shadow-sm h-full">
                  <h3 className="font-display font-bold text-base text-[var(--dj-secondary)] mb-3">{card.titulo}</h3>
                  {card.tipo === 'lista' ? (
                    <ul className="text-sm text-slate-600 leading-relaxed flex flex-col gap-1.5">
                      {card.conteudo!.split('\n').map(v => v.trim()).filter(Boolean).map(v => <li key={v}>• {v}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{card.conteudo}&rdquo;</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Localização — info à esquerda + mapa FULL-WIDTH abaixo */}
      {site.endereco && (
        <section className="py-14">
          <Reveal>
            <div className="px-6 max-w-5xl mx-auto mb-8">
              <h2 className="font-display font-bold text-xl text-[var(--dj-secondary)] mb-3">Localização</h2>
              <p className="text-sm text-slate-600 mb-1">📍 {site.endereco}</p>
              {site.telefone && <p className="text-sm text-slate-500">📞 {site.telefone}</p>}
            </div>
          </Reveal>
          {mapsQuery && (
            <div className="w-full">
              <iframe
                title="Localização da clínica"
                src={`https://maps.google.com/maps?q=${mapsQuery}&t=m&z=15&output=embed&iwloc=near`}
                width="100%"
                height="420"
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
