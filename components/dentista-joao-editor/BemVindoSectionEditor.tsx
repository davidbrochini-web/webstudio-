'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'
import { replaceFoto, addFotoToPool } from '@/app/app/editor/actions'

export default function BemVindoSectionEditor({ siteId, businessName, tagline, foto, readOnly }: {
  siteId: string
  businessName: string
  tagline: string
  foto: { id: string; url: string } | null
  readOnly: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [fotoAtual, setFotoAtual] = useState(foto)

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <EditableImage
        src={fotoAtual?.url || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=60'}
        siteId={siteId}
        readOnly={readOnly}
        className="w-full aspect-[4/3] rounded-2xl border-4 border-[#0EA5A0]/20 shadow-lg overflow-hidden"
        alt=""
        badge="Foto de destaque"
        onReplace={async (url) => {
          setErro(null)
          try {
            if (fotoAtual) { await replaceFoto(fotoAtual.id, url); setFotoAtual({ ...fotoAtual, url }) }
            else { const created = await addFotoToPool(siteId, url); if (created) setFotoAtual(created) }
          } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
        }}
      />
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-400 mb-1">Bem-vindo à</h2>
        <EditableText
          as="p" readOnly={readOnly}
          value={businessName}
          placeholder="Nome da clínica"
          className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-4 block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'business_name', v) }}
        />
        <EditableText
          as="p" readOnly={readOnly} multiline
          value={tagline}
          placeholder="Texto institucional — conte a filosofia de trabalho da clínica"
          className="text-slate-500 leading-relaxed mb-2 block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'tagline', v) }}
        />
        <p className="text-xs text-slate-400">Esse texto também aparece na página "A Clínica"</p>
        {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}
      </div>
    </section>
  )
}
