'use client'

import { useState } from 'react'
import EditableTextoCE from './EditableTextoCE'
import { texto, type TextosCustomizados } from '@/lib/textos-customizados'

export const BADGES_PADRAO = [
  { chaveIcone: 'badge1_icon', chaveLabel: 'badge1_label', icone: '🎓', label: 'Professores Qualificados' },
  { chaveIcone: 'badge2_icon', chaveLabel: 'badge2_label', icone: '🧪', label: 'Laboratórios equipados' },
  { chaveIcone: 'badge3_icon', chaveLabel: 'badge3_label', icone: '💻', label: 'Sistema Informatizado' },
  { chaveIcone: 'badge4_icon', chaveLabel: 'badge4_label', icone: '🛡️', label: 'Segurança 24 Horas' },
] as const

/** Os 4 selinhos rápidos logo abaixo do texto de proposta na Home —
 *  mesmo padrão do site antigo. Cada um é icone+texto, gravado em
 *  textos_customizados (não precisa de tabela nova pra só 4 itens
 *  fixos, sem CRUD/reordenação). */
export default function BadgesSectionEditor({ siteId, textos, readOnly, defaultExpanded }: {
  siteId: string
  textos: TextosCustomizados | null | undefined
  readOnly: boolean
  defaultExpanded?: boolean
}) {
  const [expandido, setExpandido] = useState(defaultExpanded ?? false)

  if (readOnly) {
    return null
  }

  if (!expandido) {
    return (
      <div className="bg-slate-100 px-5 sm:px-6 py-2 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => setExpandido(true)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5">
            <span>▸</span> Selinhos rápidos (os 4 ícones abaixo do texto de proposta)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-100 px-5 sm:px-6 py-4 border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        <button type="button" onClick={() => setExpandido(false)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 mb-3">
          <span>▾</span> Selinhos rápidos
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES_PADRAO.map(b => (
            <div key={b.chaveLabel} className="bg-white rounded-xl p-3 text-center">
              <EditableTextoCE siteId={siteId} chave={b.chaveIcone} readOnly={readOnly}
                valor={texto(textos, b.chaveIcone, b.icone)} as="span" className="text-2xl block mb-1" />
              <EditableTextoCE siteId={siteId} chave={b.chaveLabel} readOnly={readOnly}
                valor={texto(textos, b.chaveLabel, b.label)} as="span" className="text-xs font-semibold text-slate-600 block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
