import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, getBasePath, getCtaPrincipal } from '@/lib/localdesk'
import Header from '@/components/localdesk/Header'
import Footer from '@/components/localdesk/Footer'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Formatação, remoção de vírus, manutenção, upgrade de peças e suporte remoto — conheça todos os serviços da LocalDesk.',
}

export default async function ServicosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const { data: servicosRaw } = await supabase
    .from('site_servicos')
    .select('icon, title, description')
    .eq('site_id', site.id)
    .is('deleted_at', null)
    .order('ordem')

  const servicos = servicosRaw ?? []
  const cta = getCtaPrincipal(site, base)

  return (
    <>
      <Header base={base} cta={cta} />

      <section className="ld-container pt-14 pb-10">
        <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)] mb-3">Serviços</h1>
        <p className="ld-measure text-[var(--muted)] leading-relaxed">
          Trabalhamos só com o serviço — diagnóstico, instalação e manutenção. Não vendemos peça: se precisar de uma, você compra por conta e a gente instala.
        </p>
      </section>

      <section className="ld-container pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {servicos.map(s => (
            <div key={s.title} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-6">
              <span className="text-3xl">{s.icon}</span>
              <p className="font-bold text-[var(--ink)] mt-3 mb-2 text-lg">{s.title}</p>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ld-container pb-20">
        <div className="bg-[var(--blue)] rounded-3xl px-8 py-12 text-center">
          <h2 className="font-bold text-2xl text-white mb-3">Não achou o que precisa?</h2>
          <p className="text-white/80 mb-6">Manda uma mensagem e conta o problema — a gente te fala se dá pra resolver.</p>
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
