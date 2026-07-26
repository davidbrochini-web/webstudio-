'use client'

import { useState } from 'react'
import type { NicheFaqItem } from '@/lib/templates'

/**
 * Seção de perguntas frequentes — obrigatória em todos os templates
 * (decisão de produto, julho/2026). Puramente client-side (useState
 * pro accordion), sem chamada ao banco: os dados já chegam prontos
 * via config.faq, vindos ou do seed estático ou de site_faq.
 */
export default function FaqSection({ faq, accent, dark = false }: { faq: NicheFaqItem[]; accent: string; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)

  if (!faq.length) return null

  return (
    <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
      <h2 className={`font-display font-extrabold text-2xl sm:text-3xl text-center mb-10 ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>
        Perguntas frequentes
      </h2>
      <div className="flex flex-col gap-3">
        {faq.map(({ pergunta, resposta }, i) => {
          const isOpen = open === i
          return (
            <div key={pergunta} className={`rounded-2xl overflow-hidden border ${dark ? 'border-white/10 bg-white/5' : 'border-[var(--border)] bg-[var(--card-bg)]'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
              >
                <span className={`font-display font-bold text-sm sm:text-base ${dark ? 'text-white' : 'text-[var(--ink)]'}`}>{pergunta}</span>
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${accent} text-white text-sm font-bold flex items-center justify-center transition-transform ${isOpen ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 -mt-1">
                  <p className={`text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-[var(--muted)]'}`}>{resposta}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
