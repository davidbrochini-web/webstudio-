'use client'

import { useState } from 'react'

// Render leve de markdown pensado pro cliente final ler — tipografia
// maior e mais confortável que o DocIaViewer (esse é interno/técnico).
function renderLinha(linhaOriginal: string, i: number) {
  const linha = linhaOriginal.trimStart()
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
  if (linha.startsWith('### ')) {
    return (
      <h3 key={i} className="font-bold text-[15px] text-slate-700 mt-5 mb-1.5">
        {renderInline(linha.slice(4))}
      </h3>
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
  {
    const numMatch = linha.match(/^(\d+)\.\s(.*)/)
    if (numMatch) {
      return (
        <div key={i} className="flex gap-2.5 my-1.5">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
            style={{ background: 'var(--dj-primary, #0EA5A0)' }}
          >
            {numMatch[1]}
          </span>
          <p className="text-[15px] text-slate-600 leading-relaxed">{renderInline(numMatch[2])}</p>
        </div>
      )
    }
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
  itemId,
  campo,
  titulo,
  conteudo,
  icone = '📄',
  label = 'Documentação',
  variant = 'default',
}: {
  itemId: string
  campo: 'documentacao' | 'guia'
  titulo: string
  conteudo: string
  icone?: string
  label?: string
  variant?: 'default' | 'compact' | 'destaque'
}) {
  const [aberto, setAberto] = useState(false)
  const pdfHref = `/api/projeto-especial/documento-pdf?item=${itemId}&campo=${campo}`

  const buttonClass =
    variant === 'compact'
      ? 'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] transition-colors'
      : variant === 'destaque'
        ? 'flex-1 flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border-2 transition-colors'
        : 'text-sm font-bold px-4 py-2 rounded-full border-2 transition-colors'

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label={`Ver ${label}`}
        className={buttonClass}
        style={{ borderColor: 'var(--dj-primary, #0EA5A0)', color: 'var(--dj-primary, #0EA5A0)' }}
      >
        {variant === 'compact' ? icone : <>{icone} {label}</>}
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
            <div className="sticky top-0 bg-white flex items-center justify-between gap-3 px-6 sm:px-8 py-5 border-b border-slate-100">
              <p className="font-display font-bold text-slate-800">{titulo}</p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={pdfHref}
                  download
                  className="text-xs font-bold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap"
                  style={{ borderColor: 'var(--dj-primary, #0EA5A0)', color: 'var(--dj-primary, #0EA5A0)' }}
                >
                  ⬇ Baixar PDF
                </a>
                <button
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
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
