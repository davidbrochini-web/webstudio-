import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSiteEspecial, getBasePath, getCtaPrincipal, SITE_URL_BASE } from '@/lib/localdesk'
import Header from '@/components/localdesk/Header'
import Footer from '@/components/localdesk/Footer'

export default async function HomePage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const supabase = await createClient()

  const [{ data: servicosRaw }, { data: diferenciaisRaw }, { data: faqRaw }] = await Promise.all([
    supabase.from('site_servicos').select('icon, title, description').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_diferenciais').select('icone, titulo, texto').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
    supabase.from('site_faq').select('pergunta, resposta').eq('site_id', site.id).is('deleted_at', null).order('ordem'),
  ])

  const servicos = servicosRaw ?? []
  const diferenciais = site.secao_diferenciais_visivel ? (diferenciaisRaw ?? []) : []
  const faq = site.secao_faq_visivel ? (faqRaw ?? []) : []

  const cta = getCtaPrincipal(site, base)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.business_name,
    url: SITE_URL_BASE,
    ...(site.tagline && { description: site.tagline }),
    ...(site.telefone && { telephone: site.telefone }),
    areaServed: 'BR',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header base={base} cta={cta} />

      {/* Hero */}
      <section className="ld-container pt-14 pb-16 sm:pt-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <h1 className="font-bold text-[2.5rem] sm:text-[3.25rem] leading-[1.05] text-[var(--ink)] mb-5">
            {site.hero_title ?? 'Empresa de TI para o seu negócio'}
          </h1>
          <p className="ld-measure text-lg text-[var(--muted)] leading-relaxed mb-8">
            {site.hero_sub}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={cta.href}
              {...(cta.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-white bg-[var(--green)] px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              {cta.label}
            </a>
            <Link
              href={`${base}/servicos`}
              className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-[var(--ink)] border border-[var(--line)] px-6 py-3.5 rounded-full hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors"
            >
              Ver serviços
            </Link>
          </div>
        </div>

        {/* Foto real (Unsplash, uso comercial livre) + o "painel de
            atendimento" sobreposto na base, agora com fatos B2B em vez
            de política de conserto pessoa física. */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/5] sm:aspect-[5/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=70"
            alt="Profissional de TI trabalhando em escritório corporativo"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 bg-[var(--bg-panel)]/95 backdrop-blur border border-[var(--line)] rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="ld-status-dot" />
              <span className="font-mono text-[10px] sm:text-xs text-[var(--muted)] uppercase tracking-wide">Nossa proposta</span>
            </div>
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {[
                { label: 'Desde', valor: '2020', cor: 'var(--blue)' },
                { label: 'Atendimento', valor: 'Remoto e presencial', cor: 'var(--green)' },
                { label: 'Contratos', valor: 'Sem fidelidade obrigatória', cor: 'var(--green)' },
                { label: 'Foco', valor: 'Pequenas e médias empresas', cor: 'var(--muted)' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between border-b border-[var(--line)] pb-2 sm:pb-2.5 last:border-0 last:pb-0">
                  <span className="text-xs sm:text-sm text-[var(--muted)]">{row.label}</span>
                  <span className="text-xs sm:text-sm font-bold" style={{ color: row.cor }}>{row.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona — sequência real, numerada com propósito */}
      <section id="como-funciona" className="bg-[var(--bg-sunken)] py-16 sm:py-20">
        <div className="ld-container">
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Chama a gente', d: 'Conta pra gente o que sua empresa precisa — suporte, segurança, infraestrutura ou um sistema sob medida.' },
              { n: '2', t: 'Diagnóstico e proposta', d: 'Avaliamos o cenário e te passamos uma proposta clara, sem letras miúdas.' },
              { n: '3', t: 'Resolvido', d: 'Cuidamos da implementação e do acompanhamento contínuo — remoto ou presencial.' },
            ].map(step => (
              <div key={step.n} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-6">
                <span className="font-mono text-sm text-[var(--blue)] font-bold">{step.n}</span>
                <p className="font-bold text-[var(--ink)] mt-2 mb-2">{step.t}</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="ld-container py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)]">Soluções para sua infraestrutura digital</h2>
          <Link href={`${base}/servicos`} className="text-sm font-bold text-[var(--blue)] whitespace-nowrap hidden sm:block">Ver tudo →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicos.slice(0, 8).map(s => (
            <div key={s.title} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className="font-bold text-[var(--ink)] mt-3 mb-1.5 text-[15px]">{s.title}</p>
              <p className="text-[13px] text-[var(--muted)] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tecnologias e Parceiros */}
      <section className="bg-[var(--bg-sunken)] py-16 sm:py-20">
        <div className="ld-container text-center">
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-3">Tecnologias e Parceiros</h2>
          <p className="text-[var(--muted)] mb-10 ld-measure mx-auto">Trabalhamos com as ferramentas mais usadas do mercado pra garantir qualidade no atendimento.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Microsoft 365', 'Google Workspace', 'AnyDesk', 'TeamViewer'].map(nome => (
              <div key={nome} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl px-4 py-8 flex items-center justify-center">
                <span className="font-bold text-[var(--ink)] text-sm">{nome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que nos escolher */}
      <section className="ld-container py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-10 items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--blue)] mb-2">Por que nos escolher</p>
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-6">Parceria estratégica para o crescimento do seu negócio</h2>
          <p className="text-[var(--muted)] leading-relaxed mb-8 ld-measure">
            Entendemos que tecnologia é um investimento que deve gerar resultado pra sua empresa —
            não só mais uma conta pra pagar todo mês.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Atendimento direto, sem terceirização',
              'Soluções personalizadas pra cada negócio',
              'Parceiro Microsoft e Google',
              'Contratos flexíveis, sem fidelidade obrigatória',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="ld-status-dot flex-shrink-0" />
                <span className="text-sm text-[var(--ink)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--ink)] rounded-3xl p-8">
          <h3 className="font-bold text-xl text-white mb-3">Pronto para ter TI sem estresse?</h3>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">Fale com a gente e receba uma proposta personalizada pra sua empresa.</p>
          <a
            href={cta.href}
            {...(cta.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-[var(--ink)] bg-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {cta.label}
          </a>
        </div>
      </section>

      {/* Avaliações — honesto: sem número inventado. Assim que o
          Google Meu Negócio existir, troca esse bloco pelo widget
          real (nota, contagem, link) sem precisar redesenhar nada. */}
      <section className="bg-[var(--bg-sunken)] py-16 sm:py-20 text-center">
        <div className="ld-container">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--blue)] mb-2">Reputação</p>
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-3">Ainda estamos construindo nossa reputação no Google</h2>
          <p className="text-[var(--muted)] ld-measure mx-auto">
            A LocalDesk é nova por aqui — se você já é cliente, adoraríamos receber sua avaliação.
          </p>
        </div>
      </section>

      {/* Diferenciais — fundo com foto real de placa de circuito
          (Unsplash), overlay escuro por cima pra manter o texto
          100% legível. Dá vida sem perder contraste. */}
      {diferenciais.length > 0 && (
        <section className="relative py-16 sm:py-20 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1562408590-e32931084e23?w=1600&q=60"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--ink)]/90" />
          <div className="ld-container relative">
            <h2 className="font-bold text-2xl sm:text-3xl text-white mb-10">Por que a LocalDesk</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {diferenciais.map(d => (
                <div key={d.titulo} className="bg-[var(--ink)]/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-2xl">{d.icone}</span>
                  <p className="font-bold text-white mt-3 mb-1.5">{d.titulo}</p>
                  <p className="text-sm text-white/70 leading-relaxed">{d.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section id="faq" className="ld-container py-16 sm:py-20">
          <h2 className="font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-10">Dúvidas comuns</h2>
          <div className="ld-measure flex flex-col gap-3">
            {faq.map(f => (
              <details key={f.pergunta} className="group bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl px-5 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-[var(--ink)] text-[15px]">
                  {f.pergunta}
                  <span className="text-[var(--muted)] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-sm text-[var(--muted)] leading-relaxed mt-3">{f.resposta}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="ld-container pb-20">
        <div className="bg-[var(--blue)] rounded-3xl px-8 py-14 text-center">
          <h2 className="font-bold text-2xl sm:text-3xl text-white mb-3">{site.cta_heading ?? 'Bora resolver isso?'}</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">{site.cta_subtext ?? 'Manda uma mensagem agora e conta o que está acontecendo.'}</p>
          <a
            href={cta.href}
            {...(cta.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-[var(--blue)] bg-white px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            {cta.label}
          </a>
        </div>
      </section>

      <Footer site={site} base={base} />
    </>
  )
}
