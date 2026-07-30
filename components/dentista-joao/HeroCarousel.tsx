'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface CarouselSlide {
  titulo: string
  subtitulo: string
  imagem_url: string | null
  ctaLabel: string
  ctaHref: string
}

export default function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null
  const slide = slides[index]

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[480px] sm:h-[560px]">
        {slide.imagem_url && (
          <img
            key={slide.imagem_url}
            src={slide.imagem_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradiente duplo: escurece bordas e bottom, mantém clareza no texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B3C]/90 via-[#0B2B3C]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B3C]/60 via-transparent to-transparent" />

        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-center">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white mb-4 max-w-xl">
            {slide.titulo}
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-lg mb-8">{slide.subtitulo}</p>
          <Link
            href={slide.ctaHref}
            className="self-start bg-white text-[#0B2B3C] font-bold px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity"
          >
            {slide.ctaLabel}
          </Link>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => (i - 1 + slides.length) % slides.length)}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex(i => (i + 1) % slides.length)}
              aria-label="Próximo slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.titulo}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir pro slide ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white w-6' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
