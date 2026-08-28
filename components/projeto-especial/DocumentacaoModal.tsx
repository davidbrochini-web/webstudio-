'use client'

import { useState } from 'react'

// Render leve de markdown pensado pro cliente final ler — tipografia
// maior e mais confortável que o DocIaViewer (esse é interno/técnico).
function renderLinha(linha: string, i: number) {
  if (linha.startsWith('# ')) {
    return (
      <h1 key={i} className="font-display font-extrabold text-2xl text-[var(--dj-secondary,#0B2B3C)] mt-2 mb-4">
        {linha.slice(2)}
      </h1>
    )
  }
  if (linha.startsWith('## ')) {
    return (
      <h2 key={i} className="font-display font-bold text-lg text-[var(--dj-secondary,#0B2B3C)] mt-7 mb-2">
        {linha.slice(3)}
      </h2>
    )
  }
  if (linha.trim() === '---') return <hr key={i} className="border-slate-200 my-6" />
  if (linha.startsWith('- ')) {
    return (
      <p key={i} className="text-[15px] text-slate-600 leading-relaxed pl-5 my-1.5 relative before:content-['•'] before:absolute before:left-0 before:text-[var(--dj-primary,#0EA5A0)]">
        {renderInline(linha.slice(2))}
      </p>
    )
  }
  if (linha.startsWith('_') && linha.endsWith('_') && linha.length > 1) {
    return (
      <p key={i} className="text-xs text-slate-400 italic mt-6">
        {linha.slice(1, -1)}
      </p>
    )
  }
  if (linha.trim() === '') return <div key={i} className="h-2" />
  return (
    <p key={i} className="text-[15px] text-slate-600 leading-relaxed my-1.5">
      {renderInline(linha)}
    </p>
  )
}

function renderInline(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-800">{p.slice(2, -2)}</strong>
    }
    return p
  })
}

export default function DocumentacaoModal({
  titulo,
  conteudo,
}: {
  titulo: string
  conteudo: string
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-sm font-bold px-4 py-2 rounded-full border-2 transition-colors"
        style={{ borderColor: 'var(--dj-primary, #0EA5A0)', color: 'var(--dj-primary, #0EA5A0)' }}
      >
        📄 Documentação
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100">
              <p className="font-display font-bold text-slate-800">{titulo}</p>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 sm:px-8 py-6">
              {conteudo.split('\n').map((linha, i) => renderLinha(linha, i))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
