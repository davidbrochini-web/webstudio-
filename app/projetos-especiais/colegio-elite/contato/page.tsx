import type { Metadata } from 'next'
import { getSiteEspecial, SITE_URL_BASE, getBasePath } from '@/lib/colegio-elite'
import PageShell from '@/components/colegio-elite/PageShell'
import PageBanner from '@/components/colegio-elite/PageBanner'
import ContatoForm from '@/components/colegio-elite/ContatoForm'
import Reveal from '@/components/colegio-elite/Reveal'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contato',
    description: 'Entre em contato com o Colégio Elite — tire dúvidas, agende uma visita ou envie sua mensagem.',
    alternates: { canonical: `${SITE_URL_BASE}/contato` },
  }
}

export default async function ContatoPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null

  return (
    <PageShell site={site}>
      <PageBanner title="Contato" imageUrl={site.hero_imagem_url} base={base} />

      <section className="px-5 sm:px-6 py-16 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Reveal>
          <h2 className="font-display font-bold text-xl text-[var(--ce-secondary)] mb-4">Envie uma mensagem</h2>
          <ContatoForm />
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display font-bold text-xl text-[var(--ce-secondary)] mb-4">Outros contatos</h2>
          <div className="flex flex-col gap-2 text-sm text-slate-600 mb-6">
            {site.telefone && <p>📞 {site.telefone}</p>}
            {site.whatsapp && <p>💬 WhatsApp disponível</p>}
            {site.endereco && <p>📍 {site.endereco}</p>}
          </div>
          {mapsQuery && (
            <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm aspect-[4/3]">
              <iframe
                title="Localização do Colégio Elite"
                src={`https://maps.google.com/maps?q=${mapsQuery}&t=m&z=14&output=embed&iwloc=near`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </Reveal>
      </section>
    </PageShell>
  )
}
