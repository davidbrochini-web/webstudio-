'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { DOMAIN_MAP } from '@/lib/domain-map'

/**
 * Google Analytics — um GA4 por domínio, cada um com seu próprio
 * env var. O RootLayout serve TODOS os domínios da plataforma (não
 * pode usar headers() aqui — quebra o ISR do Casos Esquecidos,
 * decisão documentada), então a checagem de host é client-side: cada
 * domínio só injeta o script do SEU ID, nunca do de outro projeto —
 * mesma classe de cuidado do vazamento de JSON-LD que já corrigimos.
 *
 * Pra conectar um domínio novo: adiciona a env var na Vercel e uma
 * linha no mapa abaixo. Não precisa mexer em mais nada.
 *
 * `send_page_view: false` + page_view manual a cada troca de pathname/
 * searchParams: o App Router navega client-side (sem reload), então o
 * pageview automático do gtag só pegaria a carga inicial — qualquer
 * navegação depois (Link, router.push) passaria batido. Isso é o único
 * componente de GA4 da plataforma; não duplicar por projeto (aconteceu
 * uma vez no Casos Esquecidos, corrigido).
 */
const GA_POR_HOST: Record<string, string | undefined> = {
  'omnidesign.com.br': process.env.NEXT_PUBLIC_GA_ID,
  'www.omnidesign.com.br': process.env.NEXT_PUBLIC_GA_ID,
  'localhost': process.env.NEXT_PUBLIC_GA_ID,

  // Domínio antigo (drjoaobucomaxilofacial.com.br) removido em 28/08 —
  // já é redirect 308 na borda da Vercel, nunca chega aqui.
  'drjoaovictorpimenta.com.br': process.env.NEXT_PUBLIC_GA_ID_DENTISTA_JOAO,
  'www.drjoaovictorpimenta.com.br': process.env.NEXT_PUBLIC_GA_ID_DENTISTA_JOAO,

  'casosesquecidos.com.br': process.env.NEXT_PUBLIC_GA_ID_CASOS_ESQUECIDOS,
  'www.casosesquecidos.com.br': process.env.NEXT_PUBLIC_GA_ID_CASOS_ESQUECIDOS,
}

// Confere que todo domínio de projeto especial conhecido (DOMAIN_MAP)
// tem uma chave correspondente aqui — só um lembrete em dev, não
// bloqueia nada em produção.
if (process.env.NODE_ENV !== 'production') {
  for (const host of Object.keys(DOMAIN_MAP)) {
    if (!(host in GA_POR_HOST)) {
      console.warn(`[GoogleAnalytics] domínio "${host}" está em DOMAIN_MAP mas sem entrada em GA_POR_HOST`)
    }
  }
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

function PageViewTracker({ pronto }: { pronto: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Sem `pronto` como dependência, esse efeito só reexecutava na
    // TROCA de pathname — se o gtag ainda não tivesse carregado no
    // mount inicial (`typeof window.gtag !== 'function'`), o pageview
    // da carga inicial era silenciosamente perdido pra sempre, porque
    // o efeito não rodava de novo só porque o script terminou de
    // carregar. Bug pré-existente, independente da strategy — mas
    // `lazyOnload` (abaixo) o tornaria muito mais frequente. Fix:
    // `pronto` (setado no onLoad do script de init) entra como
    // dependência, então o pageview inicial dispara assim que o gtag
    // fica disponível, não só nas navegações seguintes.
    if (!pronto || typeof window.gtag !== 'function') return
    const query = searchParams.toString()
    window.gtag('event', 'page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
    })
  }, [pathname, searchParams, pronto])

  return null
}

export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null)
  const [pronto, setPronto] = useState(false)
  // Carrega o GA4 só na primeira interação real (clique, toque, scroll,
  // tecla) OU depois de 4s, o que vier primeiro — nunca compete com o
  // carregamento inicial da página por CPU/banda. Efeito real: quem
  // sai do site em menos de 4s sem tocar em nada não gera pageview —
  // na prática isso é bounce mesmo, então o número que se perde é
  // justamente o que já não contaria como visita engajada.
  const [carregarAgora, setCarregarAgora] = useState(false)

  useEffect(() => {
    const id = GA_POR_HOST[window.location.hostname]
    if (id) setGaId(id)
  }, [])

  useEffect(() => {
    if (carregarAgora) return
    const eventos: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'scroll']
    const disparar = () => setCarregarAgora(true)
    eventos.forEach(ev => window.addEventListener(ev, disparar, { once: true, passive: true }))
    const timer = window.setTimeout(disparar, 4000)
    return () => {
      eventos.forEach(ev => window.removeEventListener(ev, disparar))
      window.clearTimeout(timer)
    }
  }, [carregarAgora])

  if (!gaId || !carregarAgora) return null

  return (
    <>
      {/* strategy lazyOnload é redundante aqui (o carregarAgora já
          atrasa o mount inteiro até interação/4s) mas mantido como
          segunda camada de segurança — nunca custa nada no caminho
          crítico de qualquer jeito. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload" onLoad={() => setPronto(true)}>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
      <PageViewTracker pronto={pronto} />
    </>
  )
}
