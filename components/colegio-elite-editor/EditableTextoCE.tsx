'use client'

import EditableText from '@/components/site-editor/EditableText'
import { updateTextoCustomizadoCE } from '@/app/app/(hub)/colegio-elite/actions'

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

/**
 * Mesma ideia do EditableTextoCustomizado genérico (components/site-editor/),
 * mas usando a action do PRÓPRIO colegio-elite — não a do dentista-joao.
 *
 * Bug real encontrado e corrigido nesta sessão: o LiveEditor estava
 * importando o componente genérico direto, que chama
 * `updateTextoCustomizado` de `app/app/(hub)/projeto-especial/editor/
 * actions.ts` (dentista-joao). A gravação no banco funcionava (o
 * siteId é passado explicitamente, então ia pro registro certo), mas
 * o `revalidateAll()` de lá revalida os PATHs do dentista-joao, não
 * os do colegio-elite — ou seja, a edição salvava mas o site público
 * podia não refletir a mudança imediatamente (cache/ISR não invalidado
 * no lugar certo). Esse wrapper usa a action local, que revalida os
 * paths certos.
 */
export default function EditableTextoCE({ siteId, chave, valor, readOnly, as, className, multiline, placeholder }: Props) {
  return (
    <EditableText
      as={as}
      readOnly={readOnly}
      value={valor}
      placeholder={placeholder}
      multiline={multiline}
      className={className}
      onSave={async v => { await updateTextoCustomizadoCE(siteId, chave, v) }}
    />
  )
}
