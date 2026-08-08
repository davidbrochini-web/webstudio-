'use client'

import { useEffect, useRef } from 'react'

/**
 * Anima o "voo de drone" (object-position + leve zoom) via JavaScript
 * puro (requestAnimationFrame), em vez de @keyframes no CSS.
 *
 * Por quê: Safari/WebKit tem suporte histórico ruim pra animar
 * `object-position` via CSS — em vários iPhones a animação
 * simplesmente não roda (a imagem fica parada), mesmo funcionando
 * perfeitamente no Chrome desktop. Escrever o estilo a cada frame via
 * JS elimina essa dependência do motor de animação do navegador —
 * funciona igual em qualquer lugar, porque é só uma troca de estilo
 * inline comum, não uma interpolação de propriedade CSS.
 *
 * Onda triangular suavizada (smoothstep): sobe (embaixo → cima) e
 * desce de novo, em loop contínuo, sem corte brusco.
 */
export default function HeroDroneImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    if (!img) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      img.style.objectPosition = '50% 45%'
      img.style.transform = 'scale(1.1)'
      return
    }

    const CICLO_MS = 30000 // duração de uma "ida" (embaixo → cima)
    const inicio = performance.now()
    let raf = 0

    function tick(agora: number) {
      const decorrido = (agora - inicio) % (CICLO_MS * 2)
      const t = decorrido < CICLO_MS ? decorrido / CICLO_MS : 2 - decorrido / CICLO_MS
      const suave = t * t * (3 - 2 * t) // smoothstep — acelera e desacelera como câmera real
      const posY = 100 - suave * 100 // 100% (pátio, embaixo) → 0% (rua/prédios, em cima)
      const escala = 1.14 - Math.sin(suave * Math.PI) * 0.07 // leve respiro de zoom no meio do percurso

      if (img) {
        img.style.objectPosition = `50% ${posY}%`
        img.style.transform = `scale(${escala})`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: 'cover', objectPosition: '50% 45%', transform: 'scale(1.1)' }}
    />
  )
}
