import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import SectionBg from '@/components/casos-esquecidos/SectionBg'
import { getSiteEspecial, getAllContos, getRecentContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

// Página-hub pra intenção de busca "livros de terror para ler grátis"
// (keyword que já traz tráfego orgânico pra home segundo o Search
// Console). A home continua sendo a porta principal; esta página existe
// pra ter URL, <title> e H1 exatos pra essa busca, com conteúdo
// editorial próprio (não é cópia do arquivo). Regra editorial: nunca
// dizer que O LIVRO (Amazon, pago) é grátis — o que é grátis são os
// contos do site, e o texto deixa isso explícito.
export const metadata: Metadata = {
  title: 'Livros de Terror para Ler Grátis Online', // ≤60 c/ template
  description: 'Livros e contos de terror para ler grátis, direto no navegador: sem cadastro, sem PDF, sem pegadinha. Histórias completas de D. Broch, com casos novos toda semana.',
  alternates: { canonical: `${SITE_URL_BASE}/livros-de-terror-gratis` },
  robots: { index: true, follow: true, 'max-image-preview': 'large' } as Metadata['robots'],
  openGraph: {
    title: 'Livros de Terror para Ler Grátis — Casos Esquecidos',
    description: 'Histórias de terror completas pra ler agora, de graça, no navegador. Novos casos toda semana.',
    url: `${SITE_URL_BASE}/livros-de-terror-gratis`,
    type: 'website',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Casos Esquecidos — Livros de Terror para Ler Grátis' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Livros de Terror para Ler Grátis — Casos Esquecidos',
    description: 'Histórias de terror completas pra ler agora, de graça, no navegador.',
    images: [`${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`],
  },
}

export default async function LivrosDeTerrorGratisPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const [todos, recentes] = await Promise.all([
    getAllContos(site.id),
    getRecentContos(site.id, 6),
  ])
  const total = todos.length
  const temas = getAllTemas()

  // Contagem por tema pra mostrar "N casos" ao lado de cada tema — dado
  // real da própria listagem, sem query extra.
  const porTema = temas.map(t => ({
    ...t,
    quantidade: todos.filter(c => (c.temas || []).includes(t.slug)).length,
  }))

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL_BASE}/livros-de-terror-gratis`,
    name: 'Livros de Terror para Ler Grátis',
    description: 'Coleção completa de contos de terror gratuitos de D. Broch, para ler online sem cadastro.',
    url: `${SITE_URL_BASE}/livros-de-terror-gratis`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL_BASE}/#website`, name: 'Casos Esquecidos', url: SITE_URL_BASE },
    author: { '@type': 'Person', name: 'D. Broch', url: `${SITE_URL_BASE}/sobre` },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Contos de terror gratuitos',
      numberOfItems: total,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: [...todos]
        .sort((a, b) => b.numero - a.numero)
        .map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL_BASE}/contos/${c.slug}`,
          name: c.titulo,
        })),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Livros de terror grátis', item: `${SITE_URL_BASE}/livros-de-terror-gratis` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Header base={base} />
      <main>

      <SectionBg as="div" className="story-header" src="/assets/casos-esquecidos/bg/contos-grave.webp" priority>
        <div className="container">
          <nav className="breadcrumbs" aria-label="Você está aqui">
            <Link href={base || '/'}>Início</Link> <span>›</span> <strong>Livros de terror grátis</strong>
          </nav>
          <span className="case-number">Biblioteca aberta — {total} casos disponíveis</span>
          <h1>Livros de terror para ler grátis</h1>
          <p className="byline">Histórias completas, sem cadastro, sem PDF, sem pegadinha. É só abrir e ler.</p>
        </div>
      </SectionBg>

      <section>
        <div className="container">
          <div className="lore">
            <p>Se você chegou aqui procurando <strong>livros de terror para ler grátis</strong>, a resposta curta é: sim, tem, e é agora. O Casos Esquecidos é um arquivo de histórias de terror escritas por <Link href={`${base}/sobre`}>D. Broch</Link> e publicadas de graça, direto no site — {total} casos completos até hoje, com um novo toda semana. Não é trecho, não é amostra, não é &quot;leia os três primeiros capítulos e depois pague&quot;. Cada conto está inteiro, do começo ao fim, na página dele.</p>
            <p>Também não tem PDF pra baixar nem cadastro pra fazer. Isso é proposital: a maioria dos sites que promete livro de terror grátis entrega link de download, formulário de e-mail ou um clássico de domínio público que você já leu na escola. Aqui é diferente — as histórias são originais, brasileiras, e ficam publicadas no navegador mesmo. Funciona no celular, no computador, na fila do banco e na cama às três da manhã, quando você provavelmente não deveria estar lendo isso.</p>
            <p>Os contos são independentes: cada um é um caso fechado, e dá pra começar por qualquer um. Mas todos acontecem no mesmo universo do livro <em>Alguns Casos Devem Ficar Esquecidos</em> — lendas urbanas, criaturas que aprendem onde você mora, apartamentos com aluguel barato demais, espelhos que demoram meio segundo a mais pra devolver o reflexo. Quem lê vários começa a perceber os fios que ligam tudo. É terror psicológico antes de ser terror de susto: a ideia é que a história continue com você depois de fechar a aba.</p>
            <p>Sobre o livro em si: <em>Alguns Casos Devem Ficar Esquecidos</em>, o primeiro volume da série, é vendido na Amazon em versão física e e-book — <strong>esse é pago</strong>, e a gente não vai fingir o contrário. Os contos deste site é que são gratuitos, e continuam sendo. Se você ler alguns, gostar, e quiser os onze casos originais do Detetive num volume só, o livro está lá. Se não quiser, o arquivo continua aberto do mesmo jeito.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Por onde começar</span>
            <h2>Escolha um tipo de medo</h2>
            <p>Os casos estão organizados em sete temas. Cada tema é uma porta diferente pro mesmo lugar.</p>
          </div>
          <div className="faq-list" style={{ maxWidth: 'none' }}>
            {porTema.map(t => (
              <Link key={t.slug} href={`${base}/contos/tema/${t.slug}`} className="faq-item" style={{ display: 'block', textDecoration: 'none' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '0.4rem' }}>{t.nomeCurto} · {t.quantidade} {t.quantidade === 1 ? 'caso' : 'casos'}</span>
                <strong style={{ color: 'var(--paper)', fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{t.nome}</strong>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--paper-dim)' }}>{t.descricao}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Recém-arquivados</span>
            <h2>Os casos mais recentes</h2>
            <p>Um novo conto de terror entra no arquivo toda semana. Estes são os últimos que abriram.</p>
          </div>
          <div className="case-grid">
            {recentes.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i < 3} />
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: '2rem' }}>
            <Link className="btn btn-primary" href={`${base}/contos`}>Ver todos os {total} contos grátis</Link>
            <a className="btn btn-ghost" href={`${SITE_URL_BASE}/feed.xml`}>Assinar o feed RSS</a>
          </div>
        </div>
      </section>

      <SectionBg id="livro" src="/assets/casos-esquecidos/bg/livro-desk.webp">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">E o livro?</span>
            <h2>Alguns Casos Devem Ficar Esquecidos</h2>
          </div>
          <div className="book-block">
            <div className="book-cover-secondary">
              <Image src="/assets/casos-esquecidos/capa.jpg" alt="Capa do livro Alguns Casos Devem Ficar Esquecidos, de D. Broch" width={1024} height={1536} sizes="(max-width: 880px) 240px, 280px" />
            </div>
            <div className="lore">
              <p>O primeiro volume da série reúne os onze casos investigados pelo Detetive — o homem que já esteve preso num lugar de onde ninguém deveria voltar. Está na Amazon, em versão física e e-book. Este é o único conteúdo do universo que é pago; tudo que está publicado aqui no site continua grátis.</p>
              <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Ver o livro na Amazon</a>
                <Link className="btn btn-ghost" href={`${base}/#apoio`}>Apoiar via Pix</Link>
              </div>
            </div>
          </div>
        </div>
      </SectionBg>

      </main>
      <Footer base={base} />
    </>
  )
}
