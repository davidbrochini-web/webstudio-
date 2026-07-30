import type { Metadata } from 'next'
import { getSiteEspecial, formatTelefoneExibicao } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import ContatoForm from '@/components/dentista-joao/ContatoForm'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: 'Contato' }
}

export default async function ContatoPage() {
  const site = await getSiteEspecial()
  const mapsQuery = site.endereco ? encodeURIComponent(site.endereco) : null
  const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null

  return (
    <PageShell site={site}>
      <PageBanner title="Contato" imageUrl={site.hero_imagem_url} />

      <section className="px-6 py-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
        {/* Formulário */}
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] mb-2">Marque sua consulta!</h2>
          <p className="text-slate-500 mb-8">Utilize o formulário para escolher a melhor data e período. Nossa equipe entrará em contato para informar os horários disponíveis.</p>
          <ContatoForm />
        </div>

        {/* Bloco de informações + mapa */}
        <div>
          <h3 className="font-display font-bold text-base text-[#0B2B3C] mb-4">Entre em contato com a equipe e tire todas as suas dúvidas!</h3>

          {site.endereco && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-1">Endereço</p>
              <p className="text-sm text-slate-600">{site.endereco}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5A0] mb-1">Entre em contato</p>
            <ul className="text-sm text-slate-600 flex flex-col gap-1">
              {site.telefone && <li>📞 {site.telefone}</li>}
              {waLink && <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#0EA5A0]">💬 {formatTelefoneExibicao(site.whatsapp!)}</a></li>}
            </ul>
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
        </div>
      </section>
    </PageShell>
  )
}
