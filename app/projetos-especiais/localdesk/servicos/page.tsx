import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, getBasePath, getCtaPrincipal } from '@/lib/localdesk'
import Header from '@/components/localdesk/Header'
import Footer from '@/components/localdesk/Footer'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Suporte de TI, segurança da informação, backup em nuvem, redes e infraestrutura para sua empresa — conheça todos os serviços da LocalDesk.',
}

const ORDEM_CATEGORIAS = ['SUPORTE', 'SEGURANÇA', 'PRODUTIVIDADE', 'INFRAESTRUTURA', 'DESENVOLVIMENTO']

export default async function ServicosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const { data: servicosRaw } = await supabase
    .from('site_servicos')
    .select('icon, title, description, categoria')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  const servicos = servicosRaw ?? []
  const semCategoria = servicos.filter(s => !s.categoria)
  const cta = getCtaPrincipal(site, base)

  return (
    <>
      <Header base={base} cta={cta} />

      <section className="ld-container pt-14 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] gap-10 items-center">
        <div>
          <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)] mb-3">Serviços</h1>
          <p className="ld-measure text-[var(--muted)] leading-relaxed">
            Portfólio completo de tecnologia pra sua empresa — suporte, segurança, infraestrutura e desenvolvimento sob medida.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[4/3] hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1591238372338-22d30c883a86?w=800&q=70"
            alt="Gabinete de computador aberto durante manutenção"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="ld-container pb-20">
        {ORDEM_CATEGORIAS.map(cat => {
          const itens = servicos.filter(s => s.categoria === cat)
          if (itens.length === 0) return null
          return (
            <div key={cat} className="mb-12 last:mb-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--blue)] mb-4">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {itens.map(s => (
                  <div key={s.title} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-6">
                    <span className="text-3xl">{s.icon}</span>
                    <p className="font-bold text-[var(--ink)] mt-3 mb-2 text-lg">{s.title}</p>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {semCategoria.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {semCategoria.map(s => (
              <div key={s.title} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-6">
                <span className="text-3xl">{s.icon}</span>
                <p className="font-bold text-[var(--ink)] mt-3 mb-2 text-lg">{s.title}</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="ld-container pb-20">
        <div className="bg-[var(--blue)] rounded-3xl px-8 py-12 text-center">
          <h2 className="font-bold text-2xl text-white mb-3">Não achou o que precisa?</h2>
          <p className="text-white/80 mb-6">Fale com a gente e conta o que sua empresa precisa — a gente te diz se dá pra resolver.</p>
          <a
            href={cta.href}
            {...(cta.externo ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})}
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-[var(--blue)] bg-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {cta.label}
          </a>
        </div>
      </section>

      <Footer site={site} base={base} />
    </>
  )
}
