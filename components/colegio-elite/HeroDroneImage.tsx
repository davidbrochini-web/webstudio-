'use client'

import { useEffect, useRef } from 'react'

/**
 * Anima o "voo de drone" — sobe do pátio até a rua/prédios — com
 * movimento sempre visível, em qualquer formato de tela.
 *
 * Histórico de bugs desta animação (pra não repetir):
 * 1ª tentativa: `transform` (scale/translate) sobre um <img> com
 *   `object-fit: cover`. Object-fit recorta a imagem ANTES do
 *   transform — o transform só se move dentro da fatia já cortada,
 *   nunca revela o que ficou de fora. Nunca mostrava o pátio.
 * 2ª tentativa: animar `object-position` (que sim redefine o corte).
 *   Funcionou perfeito no desktop, mas ficou parado no mobile. Causa
 *   raiz: `object-fit: cover` corta pela LARGURA ou pela ALTURA, o
 *   que for mais restritivo. No desktop (banner bem mais largo que a
 *   foto) o corte é pela largura — sobra bastante altura pra "andar".
 *   No mobile (banner mais alto/estreito) o corte vira pela ALTURA —
 *   a imagem já usa 100% da própria altura, zero sobra, zero grau de
 *   liberdade — nenhuma animação tem "pra onde ir".
 * 3ª tentativa (esta versão): não usa `object-fit`. A imagem é
 *   dimensionada manualmente, sempre generosamente maior que o
 *   contêiner (classes de largura abaixo) — garante sobra em
 *   qualquer formato de tela. Mas o quanto dá pra "andar" com
 *   segurança (sem aparecer borda vazia) depende do tamanho real na
 *   tela de cada pessoa — por isso é MEDIDO em tempo real
 *   (getBoundingClientRect), não um número fixo chutado. O "andar"
 *   em si é só `translate`, sempre bem suportado (diferente de
 *   `object-position`, que tem suporte inconsistente no Safari).
 */
export default function HeroDroneImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    if (!img) return

    let pan = 15 // % seguro de sobra, recalculado abaixo antes de animar
    function medirSobra() {
      const container = img!.parentElement
      if (!container) return
      const alturaImg = img!.offsetHeight
      const alturaContainer = container.clientHeight
      const sobraPx = Math.max(0, alturaImg - alturaContainer)
      const sobraPercent = (sobraPx / 2 / alturaImg) * 100
      pan = Math.max(2, Math.min(sobraPercent * 0.85, 30)) // margem de segurança de 15%, teto de 30%
    }

    medirSobra()
    const onResize = () => medirSobra()
    window.addEventListener('resize', onResize)
    img.addEventListener('load', medirSobra)

    const CICLO_MS = 28000
    const inicio = performance.now()
    let raf = 0

    function tick(agora: number) {
      const decorrido = (agora - inicio) % (CICLO_MS * 2)
      const t = decorrido < CICLO_MS ? decorrido / CICLO_MS : 2 - decorrido / CICLO_MS
      const suave = t * t * (3 - 2 * t) // smoothstep
      const deslocamentoY = pan - suave * (pan * 2) // +pan (pátio) → -pan (rua/prédios)
      const escala = 1 + Math.sin(suave * Math.PI) * 0.04 // respiro leve de zoom

      if (img) {
        img.style.transform = `translate(-50%, calc(-50% + ${deslocamentoY}%)) scale(${escala})`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      img?.removeEventListener('load', medirSobra)
    }
  }, [])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className="absolute top-1/2 left-1/2 w-[260%] sm:w-[190%] md:w-[145%] lg:w-[118%] h-auto max-w-none"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  )
}
