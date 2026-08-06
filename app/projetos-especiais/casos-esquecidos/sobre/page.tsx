import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/casos-esquecidos/Header'
import Footer from '@/components/casos-esquecidos/Footer'
import { SITE_URL_BASE, getBasePath } from '@/lib/casos-esquecidos'

export const metadata: Metadata = {
  title: 'Sobre D. Broch — Autor de Terror',
  description: 'D. Broch é autor brasileiro de terror psicológico e investigação paranormal. Criador do universo Alguns Casos Devem Ficar Esquecidos e dos contos de terror publicados semanalmente neste site.',
  alternates: { canonical: `${SITE_URL_BASE}/sobre` },
  openGraph: {
    title: 'Sobre D. Broch — Autor de Terror',
    description: 'Autor brasileiro de terror psicológico e investigação paranormal.',
    images: [{ url: `${SITE_URL_BASE}/assets/casos-esquecidos/og-home.jpg`, width: 1200, height: 630, alt: 'Casos Esquecidos — D. Broch' }],
  },
}

export default async function SobrePage() {
  const base = await getBasePath()
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'D. Broch',
    url: `${SITE_URL_BASE}/sobre`,
    jobTitle: 'Escritor',
    description: 'Autor brasileiro de terror psicológico e investigação paranormal.',
    sameAs: ['https://www.amazon.com.br/dp/B0F6D1LXSV', 'https://www.instagram.com/db.casosesquecidos/'],
    knowsAbout: ['terror psicológico', 'literatura de horror', 'investigação paranormal'],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Header base={base} />
      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">O Autor</span>
            <h1>Sobre D. Broch</h1>
          </div>
          <div className="book-block">
            <div className="book-cover-secondary">
              <Image src="/assets/casos-esquecidos/capa.jpg" alt="Capa do livro Alguns Casos Devem Ficar Esquecidos, de D. Broch" width={1024} height={1536} sizes="(max-width: 880px) 280px, 300px" />
            </div>
            <div className="lore">
              <p>D. Broch é autor brasileiro de terror psicológico e investigação paranormal. Escreve sobre as frestas do mundo — os lugares, pessoas e coisas que existem entre o que a gente vê e o que a gente prefere não ver.</p>
              <p>Seu primeiro livro, <strong>Alguns Casos Devem Ficar Esquecidos</strong>, reúne onze casos investigados pelo Detetive — um homem que já esteve preso em um lugar de onde ninguém deveria voltar, e que escreve seu diário não por vaidade, mas por sobrevivência.</p>
              <p>O trabalho de D. Broch se apoia numa ideia simples: terror de verdade não precisa de gore. Precisa de dúvida. Um reflexo que demora meio segundo a mais pra se mover. Um cadeado que cai sozinho. Uma sombra que se ajusta de posição quando ninguém está olhando. Cada conto e cada caso do livro trabalha essa fronteira entre o familiar e o errado — o momento exato em que algo cotidiano para de se comportar como devia.</p>
              <p>Neste site, D. Broch publica <Link href={`${base}/contos`}>contos de terror gratuitos</Link> toda semana, todos ambientados no mesmo universo do livro: lendas urbanas, criaturas que se alimentam de medo, memória e silêncio, e as poucas pessoas (e não-pessoas) que tentam manter a fronteira entre o nosso mundo e o que existe atrás da parede amarela. Os contos podem ser lidos de forma independente — cada um é um caso fechado — mas quem acompanha vários começa a notar os fios que conectam tudo: personagens que se cruzam, criaturas que reaparecem, uma mitologia que vai se revelando aos poucos.</p>
              <p>O segundo volume da série está em andamento, e novos casos continuam sendo arquivados semanalmente enquanto ele é escrito.</p>
              <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                <a className="btn btn-primary" href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Livro na Amazon</a>
                <Link className="btn btn-ghost" href={`${base}/contos`}>Ler os contos grátis</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer base={base} />
    </>
  )
}
