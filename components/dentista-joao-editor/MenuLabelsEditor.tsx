'use client'

import { useState } from 'react'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import { texto, type TextosCustomizados } from '@/lib/textos-customizados'

// Nomes padrão de cada item do menu — os mesmos usados em SiteNav.tsx e
// MobileMenu.tsx quando o cliente não customizou nada ainda.
export const NOMES_MENU_PADRAO = {
  nav_a_clinica: 'A Clínica',
  nav_tratamentos: 'Tratamentos',
  nav_cursos: 'Cursos e Eventos',
  nav_equipe: 'Equipe',
  nav_faq: 'Dúvidas Frequentes',
  nav_artigos: 'Artigos',
  nav_contato: 'Contato',
  nav_cta: 'Marcar consulta',
} as const

/** Nomes dos itens do menu — chrome global do site (aparece em toda
 *  página), não é conteúdo de uma seção específica. Mesmo padrão
 *  recolhido/expandido do ContatosBarDJ, mas separado dele porque é
 *  outro assunto (nome de página no menu, não dado de contato). Grava
 *  em sites.textos_customizados — mesmo mecanismo dos outros textos
 *  editáveis, sem precisar de coluna nova no banco. */
export default function MenuLabelsEditor({ siteId, textos, readOnly, defaultExpanded }: {
  siteId: string
  textos: TextosCustomizados | null | undefined
  readOnly: boolean
  defaultExpanded?: boolean
}) {
  const [expandido, setExpandido] = useState(defaultExpanded ?? false)

  if (!expandido) {
    return (
      <div className="bg-slate-100 px-5 sm:px-6 py-2 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => setExpandido(true)}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5">
            <span>▸</span> Nomes do menu (o que aparece na navegação do site)
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
          <span>▾</span> Nomes do menu
        </button>
        <p className="text-[11px] text-slate-400 mb-3 max-w-lg">
          Muda só o nome que aparece no menu — o endereço da página (URL) continua o mesmo. Deixar em branco volta pro nome padrão.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          {(Object.keys(NOMES_MENU_PADRAO) as (keyof typeof NOMES_MENU_PADRAO)[]).map(chave => (
            <div key={chave} className="text-sm">
              <EditableTextoCustomizado
                siteId={siteId}
                chave={chave}
                valor={texto(textos, chave, NOMES_MENU_PADRAO[chave])}
                readOnly={readOnly}
                as="span"
                className="text-slate-700 font-medium"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
