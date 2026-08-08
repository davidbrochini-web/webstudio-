'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export interface CarouselSlide {
  titulo: string
  subtitulo: string
  imagem_url: string | null
  ctaLabel: string
  ctaHref: string
}

const AUTOPLAY_MS = 6000

/**
 * Carrossel com crossfade + Ken Burns (zoom lento na imagem ativa) e
 * texto que re-anima a cada troca. Todos os slides ficam montados e
 * empilhados (só a opacidade muda) — evita o "corte seco" e o
 * re-download da imagem que a versão anterior tinha (trocava o <img>
 * inteiro via key). Autoplay pausa quando o usuário interage (toque,
 * setas ou dots) e retoma sozinho depois. Respeita
 * prefers-reduced-motion (via classes CSS em globals.css).
 */
export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const pausedUntil = useRef(0)

  const go = useCallback((next: number, fromUser = false) => {
    if (fromUser) pausedUntil.current = Date.now() + AUTOPLAY_MS * 2
    setIndex(((next % slides.length) + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return
      setIndex(i => (i + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [slides.length])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1), true)
    touchStartX.current = null
  }

  if (slides.length === 0) return null

  return (
    <section className="relative overflow-hidden" aria-roledescription="carrossel">
      <div
        className="relative h-[420px] sm:h-[500px] lg:h-[560px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Camada de imagens — todas montadas, crossfade por opacidade.
            Duas camadas por slide: fundo desfocado (preenche a faixa
            toda, sem sobra vazia) + imagem real inteira por cima, sem
            cortar nada (object-contain) — resolve o problema de fotos
            com texto/logo perto da borda sendo cortadas em monitores
            largos, sem deixar tarja preta/vazia dos lados. */}
        {slides.map((s, i) => (
          <div
            key={s.titulo}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {s.imagem_url && (
              <>
                <img
                  src={s.imagem_url}
                  alt=""
                  aria-hidden="true"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70 hero-kenburns ${
                    i === index ? 'hero-kenburns-active' : ''
                  }`}
                />
                <img
                  src={s.imagem_url}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  {...(i === 0 ? { fetchPriority: 'high' as const } : {})}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </>
            )}
          </div>
        ))}

        {/* Gradiente duplo (fixo, por cima de todas as imagens) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--dj-secondary)]/90 via-[var(--dj-secondary)]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--dj-secondary)]/60 via-transparent to-transparent" />

        {/* Texto — key no index força re-animação a cada troca */}
        <div
          key={index}
          className="relative h-full max-w-6xl mx-auto px-5 sm:px-6 flex flex-col justify-center hero-text-enter"
        >
          {slides[index].titulo && (
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white mb-3 sm:mb-4 max-w-xl leading-tight">
              {slides[index].titulo}
            </h1>
          )}
          {slides[index].subtitulo && (
            <p className="text-white/85 text-sm sm:text-base max-w-sm sm:max-w-lg mb-6 sm:mb-8 line-clamp-3">
              {slides[index].subtitulo}
            </p>
          )}
          <Link
            href={slides[index].ctaHref}
            className="self-start bg-white text-[var(--dj-secondary)] font-bold px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base shadow-lg shadow-black/20"
          >
            {slides[index].ctaLabel}
          </Link>
        </div>

        {/* Setas de navegação removidas por decisão do cliente — troca de
            slide fica só por autoplay, swipe (mobile) e os dots abaixo. */}
        {slides.length > 1 && (
          <>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.titulo}
                  onClick={() => go(i, true)}
                  aria-label={`Ir pro slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === index ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
