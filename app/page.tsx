import Navbar     from '@/components/layout/Navbar'
import Footer     from '@/components/layout/Footer'
import Hero       from '@/components/sections/Hero'
import Stats      from '@/components/sections/Stats'
import HowItWorks from '@/components/sections/HowItWorks'
import Features   from '@/components/sections/Features'
import Modules    from '@/components/sections/Modules'
import Pricing    from '@/components/sections/Pricing'
import CtaFinal   from '@/components/sections/CtaFinal'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Modules />
        <Pricing />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
