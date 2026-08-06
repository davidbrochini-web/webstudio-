'use client'

import EditableText from './EditableText'
import { updateTextoCustomizado } from '@/app/app/(hub)/projeto-especial/editor/actions'

interface Props {
  siteId: string
  chave: string
  valor: string
  readOnly: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  className?: string
  multiline?: boolean
  placeholder?: string
}

// Mesma UX do EditableText (Editar → Salvar/Cancelar, sempre visível,
// sem depender de hover) mas grava em sites.textos_customizados em vez
// de uma coluna própria — usado pros headings/subtítulos que não tinham
// campo dedicado no banco (ver lib/textos-customizados.ts).
export default function EditableTextoCustomizado({ siteId, chave, valor, readOnly, as, className, multiline, placeholder }: Props) {
  return (
    <EditableText
      as={as}
      readOnly={readOnly}
      value={valor}
      placeholder={placeholder}
      multiline={multiline}
      className={className}
      onSave={async v => { await updateTextoCustomizado(siteId, chave, v) }}
    />
  )
}
