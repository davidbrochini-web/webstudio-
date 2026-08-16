'use client'

import { useRef } from 'react'

/**
 * Envolve um carrossel horizontal (overflow-x-auto) e adiciona setas
 * clicáveis nas laterais. Existia em 3 lugares (FeedDemo da home,
 * InstagramFeedStrip do site-template e do Colégio Elite) um carrossel
 * que só rolava por touch/trackpad — quem usa mouse sem scroll
 * horizontal (a maioria) não tinha como ver o resto, mesmo o texto
 * dizendo "arraste para o lado". `overflow-x-auto` sozinho não vira
 * "arrastável" com clique de mouse, só responde a gestos nativos de
 * scroll — daí as setas, que funcionam com qualquer input.
 *
 * Escondidas no mobile (`hidden sm:flex`) porque lá o swipe por touch
 * já funciona nativamente, sem precisar de botão.
 *
 * Cores via var(--card-bg)/var(--border)/var(--ink) de propósito, não
 * literais: em páginas da plataforma (com toggle de tema) acompanham
 * claro/escuro certinho; em Projetos Especiais sem toggle (ex: Colégio
 * Elite) a classe `.dark` nunca é aplicada, então essas variáveis
 * simplesmente ficam nos valores padrão do :root (branco/escuro fixo)
 * — funciona nos dois contextos sem precisar de prop de variante.
 */
export default function ScrollComSetas({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  function rolar(direcao: 1 | -1) {
    ref.current?.scrollBy({ left: direcao * 320, behavior: 'smooth' })
  }

  return (
    <div className="relative group/scroll">
      <div ref={ref} className="overflow-x-auto scrollbar-hide">
        {children}
      </div>
      <button
        onClick={() => rolar(-1)}
        aria-label="Ver anteriores"
        className="hidden sm:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border)] shadow-lg text-[var(--ink)] hover:opacity-80 z-10"
      >
        ‹
      </button>
      <button
        onClick={() => rolar(1)}
        aria-label="Ver próximos"
        className="hidden sm:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--card-bg)] border border-[var(--border)] shadow-lg text-[var(--ink)] hover:opacity-80 z-10"
      >
        ›
      </button>
    </div>
  )
}
