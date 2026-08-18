'use client'

import { usePathname } from 'next/navigation'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

// Rotas onde esse botão NÃO deve aparecer: painéis internos (não são
// vitrine de venda) e sites de Projeto Especial (têm marca própria —
// o WhatsApp deles é outro número, outro contexto, não faz sentido
// misturar com o da Omnidesign aqui).
const ROTAS_EXCLUIDAS = ['/admin', '/app', '/login', '/primeiro-acesso', '/projetos-especiais', '/sandbox']

export default function WhatsAppFloat({ ocultarPorDominio }: { ocultarPorDominio?: boolean }) {
  const pathname = usePathname()
  if (ocultarPorDominio) return null
  if (ROTAS_EXCLUIDAS.some(rota => pathname.startsWith(rota))) return null

  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#22c55e] shadow-xl shadow-black/20 flex items-center justify-center transition-all hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91C21.98 6.45 17.53 2 12.04 2zm5.83 14.09c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.11 1-2.4.26-.29.57-.36.76-.36s.38 0 .55.01c.18.01.41-.07.64.49.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.93.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/>
      </svg>
    </a>
  )
}
