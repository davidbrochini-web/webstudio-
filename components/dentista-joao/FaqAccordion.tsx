'use client'

import { useState } from 'react'

interface Item {
  pergunta: string
  resposta: string
  categoria?: string | null
}

export default function FaqAccordion({ itens }: { itens: Item[] }) {
  const [aberto, setAberto] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-3">
      {itens.map((f, i) => {
        const open = aberto === i
        return (
          <div key={f.pergunta} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setAberto(open ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className={`font-display font-bold text-sm transition-colors ${open ? 'text-[var(--dj-primary)]' : 'text-[var(--dj-secondary)]'}`}>
                {f.pergunta}
              </span>
              <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${open ? 'border-[var(--dj-primary)] bg-[var(--dj-primary)] text-white rotate-45' : 'border-slate-200 text-slate-400'}`}>
                +
              </span>
            </button>
            <div
              style={{ maxHeight: open ? '400px' : '0', transition: 'max-height 0.35s ease' }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{f.resposta}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
