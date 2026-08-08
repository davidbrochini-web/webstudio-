import type { Metadata } from 'next'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import Reveal from '@/components/colegio-elite/Reveal'
import { IconMetro } from '@/components/colegio-elite/icons'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Localização',
    description: 'Onde fica o Colégio Elite — endereço, mapa e como chegar.',
    alternates: { canonical: `${SITE_URL_BASE}/localizacao` },
  }
}

export default async function LocalizacaoPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null

  return (
    <PageShell site={site}>
      <PageBanner title="Localização" imageUrl={site.hero_imagem_url} base={base} />

      <section className="py-16">
        <Reveal>
          <div className="px-6 max-w-5xl mx-auto mb-8">
            <h2 className="font-display font-bold text-xl text-[var(--ce-secondary)] mb-3">Como chegar</h2>
            {site.endereco && <p className="text-sm text-slate-600 mb-1">📍 {site.endereco}</p>}
            {site.telefone && <p className="text-sm text-slate-500 mb-1">📞 {site.telefone}</p>}
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-2">
              <IconMetro className="w-4 h-4 text-[var(--ce-primary)]" />
              Acesso facilitado por avenidas principais e linhas de transporte coletivo, próximo a estações de metrô.
            </p>
          </div>
        </Reveal>
        {mapsQuery && (
          <div className="w-full">
            <iframe
              title="Localização do Colégio Elite"
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
    </PageShell>
  )
}
