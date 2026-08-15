import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import CaseCard from '@/components/casos-esquecidos/CaseCard'
import { getSiteEspecial, getRecentContos, getTotalContos, SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'


export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

// title.absolute quebra a herança do template do layout raiz da
// plataforma (%s | Omnidesign) — sem isso, como a home não define
// título próprio, o title.default do layout do projeto especial sobe
// e pega o template do avô, vazando "| Omnidesign" no <title> (bug
// achado na verificação final pós-migração; as outras páginas do CE já
// tinham metadata própria com template do próprio layout, então só a
// home era afetada).
//
// og:image e alternates.types (RSS) também precisam ser repetidos
// aqui: a metadata de página substitui o objeto inteiro do layout por
// chave (não faz merge profundo), então "alternates" e "openGraph" do
// layout somem assim que a página define os seus próprios.
export const metadata: Metadata = {
  title: { absolute: 'Casos Esquecidos — Contos e Livros de Terror | D. Broch' },
  alternates: {
    canonical: SITE_URL_BASE,
    types: { 'application/rss+xml': `${SITE_URL_BASE}/feed.xml` },
  },
  openGraph: {
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Casos Esquecidos — Contos e Livros de Terror' }],
  },
}

export default async function Home() {
  const site = await getSiteEspecial()
  const base = await getBasePath()
  const [recentContos, totalContos] = await Promise.all([
    getRecentContos(site.id, 3),
    getTotalContos(site.id),
  ])

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Onde ler contos de terror grátis?',
        acceptedAnswer: { '@type': 'Answer', text: 'Aqui no Casos Esquecidos você lê contos de terror gratuitos publicados toda semana por D. Broch — histórias de terror psicológico, lendas urbanas e investigação paranormal, todas no mesmo universo do livro Alguns Casos Devem Ficar Esquecidos.' },
      },
      {
        '@type': 'Question',
        name: 'Os contos são histórias independentes?',
        acceptedAnswer: { '@type': 'Answer', text: 'Sim. Cada caso é uma história completa e independente, mas todos acontecem no mesmo universo — personagens, lugares e criaturas podem se cruzar entre os contos e o livro.' },
      },
      {
        '@type': 'Question',
        name: 'Com que frequência saem contos novos?',
        acceptedAnswer: { '@type': 'Answer', text: 'Um novo conto de terror é publicado toda semana, sempre gratuito. O arquivo completo fica disponível na página de contos.' },
      },
    ],
  }

  const bookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Alguns Casos Devem Ficar Esquecidos',
    author: { '@type': 'Person', name: 'D. Broch' },
    url: 'https://www.amazon.com.br/dp/B0F6D1LXSV',
    genre: 'Terror',
    inLanguage: 'pt-BR',
    image: 'https://casosesquecidos.com.br/assets/casos-esquecidos/capa.jpg',
    description: 'Terror psicológico, investigação paranormal e atmosferas dignas de lendas da internet.',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header base={base} />

      <section id="contos" style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/contos-grave.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} className="section-bg">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Arquivo de Casos — Grátis para ler</span>
            <h1>Contos do universo</h1>
            <p>Histórias curtas publicadas toda semana — contadas por quem sobreviveu, ou por quem não teve essa sorte.</p>
          </div>

          <Link href={`${base}/contos`} className="archive-cta">
            <span className="archive-cta-text">
              Não quer dormir essa noite?<br />
              <strong>{totalContos} casos</strong> estão abertos no arquivo.
            </span>
            <span className="archive-cta-action">Ler todos os contos →</span>
          </Link>

          <div className="case-grid">
            {recentContos.map((conto, i) => (
              <CaseCard key={conto.id} conto={conto} prefix={`${base}/contos`} priority={i === 0} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link className="btn btn-ghost" href={`${base}/contos`}>Ver todos os casos →</Link>
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">Universo · Alguns Casos Devem Ficar Esquecidos</span>
            <h2 className="hero-title">
              Nem tudo que sorri<br />pra você é<br />
              <span className="accent">gente.</span>
            </h2>
            <p className="hero-sub">Terror psicológico e investigação paranormal, escrito por D. Broch. Novos casos do universo publicados toda semana — de graça, aqui.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={`${base}/contos`}>Ler os contos</Link>
              <a className="btn btn-ghost" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Comprar o livro</a>
            </div>
          </div>
          <div className="hero-covers">
            <div className="hero-cover-main">
              <Image src="/assets/casos-esquecidos/capa.jpg" alt="Capa do livro Alguns Casos Devem Ficar Esquecidos, de D. Broch." width={1024} height={1536} sizes="(max-width: 480px) 200px, (max-width: 880px) 260px, 290px" priority />
            </div>
            <div className="hero-cover-back">
              <Image src="/assets/casos-esquecidos/capa-livro-2.jpg" alt="Capa do segundo livro de D. Broch — em andamento" width={800} height={1200} sizes="(max-width: 480px) 170px, (max-width: 880px) 220px, 240px" />
              <span className="hero-cover-badge">Em andamento</span>
            </div>
          </div>
        </div>
      </section>

      <section id="livro" style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/livro-desk.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} className="section-bg">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">O Universo em Livro</span>
            <h2>A saga de D. Broch</h2>
            <p>Os casos do Detetive — disponíveis na Amazon e em andamento.</p>
          </div>
          <div className="livros-grid">
            <div className="livro-item">
              <div className="hero-cover">
                <Image src="/assets/casos-esquecidos/capa.jpg" alt="Capa do livro Alguns Casos Devem Ficar Esquecidos, de D. Broch" width={1024} height={1536} sizes="(max-width: 560px) 90vw, (max-width: 880px) 400px, 320px" />
              </div>
              <div className="livro-item-info">
                <span className="eyebrow">Volume 1 — Disponível agora</span>
                <h3>Alguns Casos Devem Ficar Esquecidos</h3>
                <div className="synopsis">
                  <blockquote>O Detetive. Frio, irônico, de raciocínio rápido… mas longe de ser perfeito. Escrever o diário não é vaidade. É sobrevivência.</blockquote>
                  <ul>
                    <li>Um sorriso que persegue nos espelhos — e volta toda vez que você tenta esquecer.</li>
                    <li>Uma imagem que te escolhe antes de você escolher ela.</li>
                    <li>Um espírito que nunca se despediu de casa.</li>
                    <li>Um restaurante de beira de estrada onde a comida é só o começo do pesadelo.</li>
                    <li>Um clube noturno onde ninguém acorda igual na manhã seguinte.</li>
                    <li>Ele não precisa se mover. Ele só precisa esperar entre as árvores.</li>
                    <li>Uma boneca que acordava em outro lugar — e nem todo monstro usa dentes.</li>
                    <li>Você acorda. Não consegue se mover. Mas algo consegue.</li>
                    <li>Um programa que ninguém gravou. Que ninguém esqueceu.</li>
                    <li>O maior perigo não estava do lado de fora.</li>
                    <li>A cidade de Araras sabia. A cidade sempre soube.</li>
                  </ul>
                </div>
                <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Adquirir na Amazon</a>
              </div>
            </div>

            <div className="livro-item livro-em-andamento">
              <div className="hero-cover" style={{ maxWidth: '220px' }}>
                <Image src="/assets/casos-esquecidos/capa-livro-2.jpg" alt="Capa do segundo livro de D. Broch — em andamento" width={800} height={1200} sizes="220px" />
                <div className="livro-badge">Em andamento</div>
              </div>
              <div className="livro-item-info">
                <span className="eyebrow">Volume 2 — Em construção</span>
                <h3 style={{ color: 'var(--muted)' }}>Título a revelar</h3>
                <p style={{ color: 'var(--muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>O segundo volume está sendo escrito.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="universo" style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/universo-cult.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} className="section-bg lore">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">O Universo</span>
            <h2>O que existe atrás da parede amarela</h2>
          </div>
          <p>Em algum lugar entre o asfalto molhado e o néon que nunca apaga de vez, existem portas que não deveriam existir.</p>
          <p>Elas não têm forma fixa. Podem ser um corredor de hotel, uma parede amarela desbotada, um restaurante de beira de estrada que ninguém lembra de ter visto antes. Alguns que passaram por lá tentaram descrever. A maioria parou de tentar. Os que não pararam... deixaram de ser bons narradores.</p>
          <p>Existem aqueles que caçam o que vive nessas frestas. Existem aqueles que são caçados. E existem os que nunca tiveram escolha — que foram tocados por esse mundo antes mesmo de saber que ele existia, e agora carregam isso como cicatriz, como bússola, como maldição.</p>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Perguntas Frequentes</span>
            <h2>Sobre os contos de terror</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>Onde ler contos de terror grátis?</summary>
              <p>Aqui no Casos Esquecidos você lê contos de terror gratuitos publicados toda semana por D. Broch — histórias de terror psicológico, lendas urbanas e investigação paranormal, todas no mesmo universo do livro <em>Alguns Casos Devem Ficar Esquecidos</em>.</p>
            </details>
            <details className="faq-item">
              <summary>Os contos são histórias independentes?</summary>
              <p>Sim. Cada caso é uma história completa e independente, mas todos acontecem no mesmo universo — personagens, lugares e criaturas podem se cruzar entre os contos e o livro.</p>
            </details>
            <details className="faq-item">
              <summary>Com que frequência saem contos novos?</summary>
              <p>Um novo conto de terror é publicado toda semana, sempre gratuito. O arquivo completo fica na <Link href={`${base}/contos`}>página de contos</Link>.</p>
            </details>
          </div>
        </div>
      </section>

      <section id="apoio" style={{ backgroundImage: "url('/assets/casos-esquecidos/bg/apoio-door.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} className="section-bg">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Apoie o trabalho</span>
            <h2>Ajude a manter os casos abertos</h2>
          </div>
          <div className="support-block">
            <div>
              <p style={{ color: 'var(--paper-dim)' }}>Toda doação vai direto para o tempo de escrita dos próximos casos. Não existe valor mínimo — é livre, como uma forma de dizer &quot;continua&quot;.</p>
              <div className="pix-key">david.brochini@gmail.com</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                ⚠ Antes de confirmar, verifique se a chave é <strong style={{ color: 'var(--paper-dim)' }}>david.brochini@gmail.com</strong>
              </p>
            </div>
            <div className="qr-frame">
              <Image src="/assets/casos-esquecidos/pix-qrcode.png" alt="QR Code Pix — chave david.brochini@gmail.com" width={180} height={180} />
            </div>
          </div>
        </div>
      </section>

      <Footer base={base} />
    </>
  )
}
