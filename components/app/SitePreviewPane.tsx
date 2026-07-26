'use client'

import { useState } from 'react'

export default function SitePreviewPane({ slug }: { slug: string }) {
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-[var(--muted)]">
          👀 É assim que o seu site está agora — as mudanças aparecem aqui depois de salvar
        </p>
        <button
          onClick={() => setReloadKey(k => k + 1)}
          className="text-xs font-semibold text-[var(--brand)] flex-shrink-0 ml-3"
        >
          ↻ Atualizar prévia
        </button>
      </div>
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-white" style={{ height: 380 }}>
        <iframe
          key={reloadKey}
          src={`/sandbox/${slug}`}
          title="Prévia do seu site"
          className="w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    </div>
  )
}
