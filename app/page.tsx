import Navbar      from '@/components/layout/Navbar'
import Footer      from '@/components/layout/Footer'
import AdsBanner   from '@/components/sections/AdsBanner'
import Hero        from '@/components/sections/Hero'
import FeedDemo    from '@/components/sections/FeedDemo'
import Stats       from '@/components/sections/Stats'
import HowItWorks  from '@/components/sections/HowItWorks'
import Templates   from '@/components/sections/Templates'
import Features    from '@/components/sections/Features'
import AdsServices from '@/components/sections/AdsServices'
import Modules     from '@/components/sections/Modules'
import Pricing     from '@/components/sections/Pricing'
import Faq         from '@/components/sections/Faq'
import CtaFinal    from '@/components/sections/CtaFinal'

export default function Home() {
  // JSON-LD da Organização — vivia no RootLayout e vazava pra TODAS
  // as páginas, inclusive domínios white-label de cliente (o site do
  // Dr. João expunha metadado dizendo ser da Omnidesign). Movido pra
  // cá: a home da Omnidesign é onde esse schema importa pro SEO da
  // marca. Não usar detecção de host no layout raiz — headers()
  // tornaria a árvore inteira dinâmica e mataria o ISR do Casos
  // Esquecidos.
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Omnidesign',
    url: 'https://omnidesign.com.br',
    logo: 'https://omnidesign.com.br/brand/omnidesign-logo.png',
    description: 'Sites profissionais conectados ao Instagram e sistemas internos sob medida para pequenos e médios negócios.',
    areaServed: 'BR',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <Navbar />
      <AdsBanner />
      <main>
        <Hero />
        <FeedDemo />
        <Stats />
        <HowItWorks />
        <Templates />
        <Features />
        <AdsServices />
        <Modules />
        <Pricing />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
