'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
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
 */
const GA_POR_HOST: Record<string, string | undefined> = {
  'omnidesign.com.br': process.env.NEXT_PUBLIC_GA_ID,
  'www.omnidesign.com.br': process.env.NEXT_PUBLIC_GA_ID,
  'localhost': process.env.NEXT_PUBLIC_GA_ID,

  'drjoaobucomaxilofacial.com.br': process.env.NEXT_PUBLIC_GA_ID_DENTISTA_JOAO,
  'www.drjoaobucomaxilofacial.com.br': process.env.NEXT_PUBLIC_GA_ID_DENTISTA_JOAO,

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

export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null)

  useEffect(() => {
    const id = GA_POR_HOST[window.location.hostname]
    if (id) setGaId(id)
  }, [])

  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
