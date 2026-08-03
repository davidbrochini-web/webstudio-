'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'

interface Props {
  siteId: string
  heroTitle: string
  heroSub: string
  heroImagemUrl: string | null
  readOnly: boolean
}

/** Espelha o banner principal (HeroCarousel) do site real — aqui sem
 *  autoplay/crossfade, só o primeiro slide, que é o único editável
 *  (os demais slides do carrossel real vêm dos tratamentos). */
export default function HeroSectionEditor({ siteId, heroTitle, heroSub, heroImagemUrl, readOnly }: Props) {
  const [erro, setErro] = useState<string | null>(null)

  return (
    <section className="relative overflow-hidden h-[360px] sm:h-[440px]">
      <EditableImage
        src={heroImagemUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=60'}
        siteId={siteId}
        readOnly={readOnly}
        aspect={16 / 9}
        className="absolute inset-0 w-full h-full"
        alt=""
        badge="Foto do banner"
        onReplace={async (url) => {
          setErro(null)
          try { await updateSiteFieldPE(siteId, 'hero_imagem_url', url) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
        }}
        onRemove={async () => {
          setErro(null)
          try { await updateSiteFieldPE(siteId, 'hero_imagem_url', '') } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover.') }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B2B3C]/90 via-[#0B2B3C]/55 to-transparent pointer-events-none" />

      <div className="relative h-full max-w-4xl mx-auto px-5 sm:px-6 flex flex-col justify-center">
        <EditableText
          as="h1" readOnly={readOnly}
          value={heroTitle}
          placeholder="Título de destaque"
          className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3 max-w-xl leading-tight block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'hero_title', v) }}
        />
        <EditableText
          as="p" readOnly={readOnly}
          value={heroSub}
          placeholder="Subtítulo de apoio"
          multiline
          className="text-white/85 text-sm sm:text-base max-w-md mb-6 block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'hero_sub', v) }}
        />
        <span className="self-start bg-white text-[#0B2B3C] font-bold px-5 py-2.5 rounded-full text-sm shadow-lg opacity-70">
          Marcar consulta
        </span>
        <p className="text-white/40 text-[10px] mt-2">Botão fixo — não editável aqui</p>
      </div>

      {erro && <p className="absolute bottom-2 left-2 text-xs text-red-300 bg-black/60 px-2 py-1 rounded">{erro}</p>}
    </section>
  )
}
