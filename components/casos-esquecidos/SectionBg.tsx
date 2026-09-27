import type { CSSProperties, ReactNode } from 'react'

/**
 * Substitui o padrão antigo `<section style={{ backgroundImage: "url(...)" }}>`.
 * CSS `background-image` inline SEMPRE carrega, mesmo fora da dobra — não
 * existe `loading="lazy"` pra ele. Um `<img>` real por trás do conteúdo tem
 * lazy loading nativo do navegador (`loading="lazy"`) e prioridade real
 * (`fetchPriority`), então cada seção decide se é a primeira coisa que o
 * usuário vê (`priority`) ou se pode esperar o scroll chegar perto dela.
 *
 * Depende de `.section-bg { position: relative; isolation: isolate }` e
 * `.section-bg::before` (overlay escuro, z-index -1) já existentes em
 * ce-styles.css — a imagem entra em z-index -2, atrás do overlay.
 */
export default function SectionBg({
  as: As = 'section',
  src,
  id,
  className = '',
  style,
  priority = false,
  children,
}: {
  as?: 'section' | 'div'
  src: string
  id?: string
  className?: string
  style?: CSSProperties
  priority?: boolean
  children: ReactNode
}) {
  // Variante leve pro celular (640px, ~20KB em vez de ~100KB). O overlay
  // de .section-bg::before cobre a imagem com 88-93% de preto, então a
  // perda de resolução é invisível. <picture> + media query (e não srcset
  // com `w`) porque srcset multiplica pelo DPR: um celular com DPR 2,6
  // pediria a versão de 1024px do mesmo jeito. Convenção: arquivo
  // `nome-640.webp` ao lado de `nome.webp` em /assets/casos-esquecidos/bg/.
  const mobileSrc = src.startsWith('/assets/casos-esquecidos/bg/') && src.endsWith('.webp')
    ? src.replace(/\.webp$/, '-640.webp')
    : null
  return (
    <As id={id} className={`section-bg ${className}`.trim()} style={style}>
      <picture>
      {mobileSrc && <source media="(max-width: 700px)" srcSet={mobileSrc} />}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: -2 }}
      />
      </picture>
      {children}
    </As>
  )
}
