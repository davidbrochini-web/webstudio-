import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getAllContos, getCasosAgendados } from '@/lib/casos-esquecidos'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'

const BASE = '/projetos-especiais/casos-esquecidos'
export const POR_PAGINA = 13

export function hrefDaPagina(n: number): string {
  return n <= 1 ? `${BASE}/contos` : `${BASE}/contos/pagina/${n}`
}

function formatarDataAbertura(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export default async function ContosArchive({ siteId, pagina }: { siteId: string; pagina: number }) {
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Header />
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Arquivo de Casos</span>
            <h1>Contos de Terror para Ler Grátis</h1>
            <p>Histórias de terror publicadas toda semana por D. Broch. Cada caso é uma história independente do universo de &quot;Alguns Casos Devem Ficar Esquecidos&quot;.</p>
          </div>
          <div className="tema-nav" aria-label="Temas">
            {getAllTemas().map(t => (
              <Link key={t.slug} href={`${BASE}/contos/tema/${t.slug}`} className="tema-tag">{t.nomeCurto}</Link>
            ))}
          </div>
          <div className="case-grid">
            {ehPrimeiraPagina && agendadosOrdenados.map(a => (
              <article key={a.numero} className="case-card locked">
                <span className="case-number">Caso Nº {String(a.numero).padStart(3, '0')}</span>
                <h3>{a.titulo}</h3>
                <p className="case-excerpt">Esse mistério vai abrir dia {formatarDataAbertura(a.data_publicacao)}.</p>
                <div className="case-meta">
                  <span>—</span>
                  <span className="status-tag" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>Selado — Agendado</span>
                </div>
              </article>
            ))}
            {contosPagina.map(conto => (
              <CaseCard key={conto.id} conto={conto} />
            ))}
            {ehUltimaPagina && agendadosOrdenados.length === 0 && (
              <article className="case-card locked">
                <span className="case-number">Caso Nº {String(ordenados.length + 1).padStart(3, '0')}</span>
                <h3>Em breve</h3>
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
                  <Link href={hrefDaPagina(paginaAtual - 1)} className="btn btn-ghost">&larr; Anterior</Link>
                )}
                <span className="pagination-status">Página {paginaAtual} de {totalPaginas}</span>
                {paginaAtual < totalPaginas && (
                  <Link href={hrefDaPagina(paginaAtual + 1)} className="btn btn-ghost">Próxima &rarr;</Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </section>

      <section style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/apoio-door.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '3rem 0' }} className="section-bg">
        <div className="container">
          <div className="support-block">
            <div>
              <span className="eyebrow">Gostou dos contos?</span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.6rem' }}>Mantenha os casos chegando</h2>
              <p style={{ color: 'var(--paper-dim)', marginTop: '0.75rem' }}>Os contos são gratuitos, mas levam tempo pra escrever. Compre o livro na Amazon ou faça uma doação via Pix.</p>
              <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Comprar o livro</a>
                <Link className="btn btn-ghost" href={`${BASE}#apoio`}>Apoiar via Pix</Link>
              </div>
            </div>
            <div className="qr-frame">
              <Image src="/assets/casos-esquecidos/pix-qrcode.png" alt="QR Code Pix" width={180} height={180} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
