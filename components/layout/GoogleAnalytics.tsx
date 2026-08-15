'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

/**
 * Google Analytics 4 da OMNIDESIGN — só ativa se:
 * 1. NEXT_PUBLIC_GA_ID estiver setado na Vercel (G-XXXXXXXXXX), e
 * 2. o host for omnidesign.com.br (ou localhost pra teste).
 *
 * A checagem de host é client-side de propósito: o RootLayout serve
 * TODOS os domínios (Dentista João, Casos Esquecidos, Colégio Elite)
 * e não pode usar headers() (quebra o ISR do Casos Esquecidos —
 * decisão documentada). Sem essa checagem, o Analytics da agência
 * vazaria pros sites white-label — mesma classe do bug do JSON-LD.
 */
const HOSTS_PERMITIDOS = ['omnidesign.com.br', 'www.omnidesign.com.br', 'localhost']

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    if (HOSTS_PERMITIDOS.includes(window.location.hostname)) setAtivo(true)
  }, [])

  if (!gaId || !ativo) return null

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
