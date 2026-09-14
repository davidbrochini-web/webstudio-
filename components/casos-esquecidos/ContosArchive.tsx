import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getAllContos, getCasosAgendados } from '@/lib/casos-esquecidos'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'

export const POR_PAGINA = 13

function hrefDaPagina(base: string, n: number): string {
  return n <= 1 ? `${base}/contos` : `${base}/contos/pagina/${n}`
}

function formatarDataAbertura(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default async function ContosArchive({ siteId, pagina, base }: { siteId: string; pagina: number; base: string }) {
  const [contos, agendados] = await Promise.all([
    getAllContos(siteId),
    getCasosAgendados(siteId),
  ])
  const ordenados = [...contos].sort((a, b) => b.numero - a.numero)

  const totalPaginas = Math.max(Math.ceil(ordenados.length / POR_PAGINA), 1)
  const paginaAtual = Math.min(Math.max(pagina, 1), totalPaginas)
  const inicio = (paginaAtual - 1) * POR_PAGINA
  const contosPagina = ordenados.slice(inicio, inicio + POR_PAGINA)
  const ehUltimaPagina = paginaAtual === totalPaginas
  const ehPrimeiraPagina = paginaAtual === 1
  const agendadosOrdenados = [...agendados].sort((a, b) => b.numero - a.numero)

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: contosPagina.map((c, i) => ({
      '@type': 'ListItem',
      position: inicio + i + 1,
      url: `https://casosesquecidos.com.br/contos/${c.slug}`,
      name: c.titulo,
    })),
  }

  // FAQ só na página 1 (a canônica/indexada) — evita schema e conteúdo
  // duplicado nas páginas 2+ do arquivo, que já ficam de fora do sitemap.
  const faqSchema = ehPrimeiraPagina ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Os contos de terror são grátis mesmo?',
        acceptedAnswer: { '@type': 'Answer', text: `Sim, os ${ordenados.length} casos publicados aqui são 100% gratuitos — sem assinatura, sem cadastro, sem limite de leitura por mês. O único conteúdo pago do universo é o livro Alguns Casos Devem Ficar Esquecidos, vendido separadamente na Amazon.` },
      },
      {
        '@type': 'Question',
        name: 'Preciso ler os contos em ordem?',
        acceptedAnswer: { '@type': 'Answer', text: 'Não. Cada caso é uma história independente — dá pra começar por qualquer um. Quem lê vários fora de ordem só descobre as conexões entre eles um pouco mais tarde, o que também é uma forma válida de ler.' },
      },
      {
        '@type': 'Question',
        name: 'O arquivo é atualizado com que frequência?',
        acceptedAnswer: { '@type': 'Answer', text: 'Um conto novo é publicado toda semana. Este arquivo (e o feed RSS) sempre reflete a lista mais recente.' },
      },
    ],
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <Header base={base} />
      <main>
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Arquivo de Casos</span>
            <h1>Contos de Terror para Ler Grátis</h1>
            <p>Histórias de terror publicadas toda semana por D. Broch. Cada caso é uma história independente do universo de &quot;Alguns Casos Devem Ficar Esquecidos&quot; — completa, gratuita e sem cadastro. Primeira vez aqui? Veja <Link href={`${base}/livros-de-terror-gratis`}>por onde começar</Link>.</p>
          </div>
          <div className="tema-nav" aria-label="Temas">
            {getAllTemas().map(t => (
              <Link key={t.slug} href={`${base}/contos/tema/${t.slug}`} className="tema-tag">{t.nomeCurto}</Link>
            ))}
          </div>
          <div className="tema-nav" aria-label="Outras formas de explorar o arquivo" style={{ marginTop: '-0.5rem' }}>
            <Link href={`${base}/contos/curtos`} className="tema-tag">Contos Curtos</Link>
            <Link href={`${base}/contos/brasileiros`} className="tema-tag">Contos Brasileiros</Link>
            <Link href={`${base}/contos/para-dormir`} className="tema-tag">Pra Ler Antes de Dormir</Link>
            <Link href={`${base}/creepypasta-brasileira`} className="tema-tag">Creepypasta Brasileira</Link>
          </div>
          <div className="case-grid">
            {ehPrimeiraPagina && agendadosOrdenados.map(a => (
              <article key={a.numero} className="case-card locked">
                <span className="case-number">Caso Nº {String(a.numero).padStart(3, '0')}</span>
                <h2>{a.titulo}</h2>
                <p className="case-excerpt">Esse mistério vai abrir dia {formatarDataAbertura(a.data_publicacao)}.</p>
                <div className="case-meta">
                  <span>—</span>
                  <span className="status-tag" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>Selado — Agendado</span>
                </div>
              </article>
            ))}
            {contosPagina.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
            {ehUltimaPagina && agendadosOrdenados.length === 0 && (
              <article className="case-card locked">
                <span className="case-number">Caso Nº {String(ordenados.length + 1).padStart(3, '0')}</span>
                <h2>Em breve</h2>
                <p className="case-excerpt">Um novo caso é arquivado toda semana. Volte em breve ou acompanhe nas redes para saber quando abrir.</p>
                <div className="case-meta">
                  <span>—</span>
                  <span className="status-tag" style={{ borderColor: 'var(--muted)', color: 'var(--muted)' }}>Selado</span>
                </div>
              </article>
            )}
          </div>

          {totalPaginas > 1 && (
            <nav className="pagination" aria-label="Paginação de casos">
              <p className="pagination-note">13 casos por página. Não foi coincidência.</p>
              <div className="pagination-links">
                {paginaAtual > 1 && (
                  <Link href={hrefDaPagina(base, paginaAtual - 1)} className="btn btn-ghost">&larr; Anterior</Link>
                )}
                <span className="pagination-status">Página {paginaAtual} de {totalPaginas}</span>
                {paginaAtual < totalPaginas && (
                  <Link href={hrefDaPagina(base, paginaAtual + 1)} className="btn btn-ghost">Próxima &rarr;</Link>
                )}
              </div>
            </nav>
          )}

          {ehPrimeiraPagina && (
            <div className="lore" style={{ marginTop: '3rem', maxWidth: '68ch' }}>
              <p>Este arquivo reúne todos os contos de terror grátis já publicados por D. Broch — {ordenados.length} casos até agora, todos completos, todos gratuitos, sem cadastro e sem baixar nada. Não é uma amostra do livro: são histórias próprias, escritas direto pra serem lidas aqui, no navegador, em qualquer ordem que você quiser começar.</p>
              <p>A frequência é semanal, então o arquivo cresce toda semana — se você já leu tudo, volte em alguns dias que tem caso novo. Enquanto isso, os temas acima ajudam a filtrar por tipo de medo: lendas urbanas, terror psicológico, sobrenatural, criaturas, terror da internet, maldições ou assombração.</p>
            </div>
          )}
        </div>
      </section>

      {ehPrimeiraPagina && (
        <section id="faq-contos">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Perguntas Frequentes</span>
              <h2>Sobre o arquivo de contos</h2>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>Os contos de terror são grátis mesmo?</summary>
                <p>Sim, os {ordenados.length} casos publicados aqui são 100% gratuitos — sem assinatura, sem cadastro, sem limite de leitura por mês. O único conteúdo pago do universo é o livro <em>Alguns Casos Devem Ficar Esquecidos</em>, vendido separadamente na Amazon.</p>
              </details>
              <details className="faq-item">
                <summary>Preciso ler os contos em ordem?</summary>
                <p>Não. Cada caso é uma história independente — dá pra começar por qualquer um. Quem lê vários fora de ordem só descobre as conexões entre eles um pouco mais tarde, o que também é uma forma válida de ler.</p>
              </details>
              <details className="faq-item">
                <summary>O arquivo é atualizado com que frequência?</summary>
                <p>Um conto novo é publicado toda semana. Este arquivo (e o <Link href={`${base}/feed.xml`}>feed RSS</Link>) sempre reflete a lista mais recente.</p>
              </details>
            </div>
          </div>
        </section>
      )}

      <section style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/apoio-door.webp')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '3rem 0' }} className="section-bg">
        <div className="container">
          <div className="support-block">
            <div>
              <span className="eyebrow">Gostou dos contos?</span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.6rem' }}>Mantenha os casos chegando</h2>
              <p style={{ color: 'var(--paper-dim)', marginTop: '0.75rem' }}>Os contos são gratuitos, mas levam tempo pra escrever. Compre o livro na Amazon ou faça uma doação via Pix.</p>
              <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Comprar o livro</a>
                <Link className="btn btn-ghost" href={`${base}/#apoio`}>Apoiar via Pix</Link>
              </div>
            </div>
            <div className="qr-frame">
              <Image src="/assets/casos-esquecidos/pix-qrcode.png" alt="QR Code Pix" width={180} height={180} />
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer base={base} />
    </>
  )
}
