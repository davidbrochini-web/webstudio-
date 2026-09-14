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

  useEffect(() => {
    const id = GA_POR_HOST[window.location.hostname]
    if (id) setGaId(id)
  }, [])

  if (!gaId) return null

  return (
    <>
      {/* lazyOnload (em vez de afterInteractive): tira o gtag.js do
          caminho crítico de hidratação — no Lighthouse mobile do Casos
          Esquecidos isso custava ~393ms de bootup-time dentro do TBT.
          GA4 não precisa competir com a página ficando interativa;
          o fix de `pronto` acima garante que o pageview inicial não se
          perde só porque o script demora mais pra carregar agora. */}
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
