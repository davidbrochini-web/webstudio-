import type { Metadata } from 'next'
import { getSiteEspecial, getBasePath, getCtaPrincipal, formatTelefoneExibicao } from '@/lib/localdesk'
import Header from '@/components/localdesk/Header'
import Footer from '@/components/localdesk/Footer'
import ContatoForm from '@/components/localdesk/ContatoForm'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a LocalDesk — preencha o formulário e a gente retorna. Atendimento remoto em todo o Brasil e a domicílio em São Paulo, SP.',
}

export default async function ContatoPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const cta = getCtaPrincipal(site, base)
  // Na própria página de Contato, só faz sentido mostrar o botão de
  // atalho quando ele for pra fora (WhatsApp) — senão ele apontaria
  // pra essa mesma página, o que não faz sentido.
  const mostrarBotaoAtalho = cta.externo

  return (
    <>
      <Header base={base} cta={cta} />

      <section className="ld-container pt-14 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h1 className="font-bold text-3xl sm:text-4xl text-[var(--ink)] mb-4">Fale com a gente</h1>
          <p className="text-[var(--muted)] leading-relaxed mb-8">
            Preenche o formulário ao lado contando o que está acontecendo — a gente retorna pra entender o problema e passar um orçamento.
          </p>

          {mostrarBotaoAtalho && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-white bg-[var(--green)] px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity mb-8"
            >
              {cta.label}
            </a>
          )}

          <div className="flex flex-col gap-4">
            {site.telefone && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-1">Telefone</p>
                <p className="text-[var(--ink)]">{formatTelefoneExibicao(site.telefone)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-1">Cobertura</p>
              <p className="text-[var(--ink)]">{site.endereco}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 h-fit">
          <ContatoForm />
        </div>
      </section>

      <Footer site={site} base={base} />
    </>
  )
}
