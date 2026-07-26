'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import FotoPoolSection, { type Foto } from '@/components/site-editor/FotoPoolSection'
import { EditableServicoRow, type Servico } from '@/components/site-editor/EditableServicoRow'
import { EditableDepoimentoCard, type Depoimento } from '@/components/site-editor/EditableDepoimentoCard'
import { updateSiteField, replaceFoto, addFotoToPool, upsertServicoInline, upsertDepoimentoInline } from '@/app/app/editor/actions'


export interface SiteData {
  id: string
  business_name: string
  tagline: string
  hero_title: string
  cta_label: string
  cta_heading: string | null
  cta_subtext: string | null
}

export default function PortfolioLiveEditor({ site, servicos: servicosInit, fotos: fotosInit, depoimento: depoimentoInit, accent, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimento: Depoimento | null
  accent: string
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [fotos, setFotos] = useState(fotosInit)
  const [depoimento, setDepoimento] = useState(depoimentoInit)

  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'cta_label' | 'cta_heading' | 'cta_subtext') => (v: string) => updateSiteField(site.id, field, v)
  const mosaico = [fotos[0], fotos[1], fotos[2], fotos[3]]
  const restoFotos = fotos.slice(4)

  async function handleMosaicoReplace(idx: number, url: string) {
    const foto = mosaico[idx]
    if (foto) {
      await replaceFoto(foto.id, url)
      setFotos(fs => fs.map(f => (f.id === foto.id ? { ...f, url } : f)))
    } else {
      const created = await addFotoToPool(site.id, url)
      if (created) setFotos(fs => [...fs, created])
    }
  }

  return (
    <div className="bg-white text-[#1e293b]">
      <nav className="relative z-10 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto -mb-16 pt-3">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg text-white drop-shadow" onSave={fieldSaver('business_name')} />
        <span className="bg-white/90 backdrop-blur text-[#1e293b] text-sm font-semibold px-4 py-2 rounded-lg" title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="relative grid grid-cols-4 grid-rows-2 gap-1.5 h-[70vh] min-h-[440px] px-1.5 pt-1.5">
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-sm">
          <EditableImage siteId={site.id} src={mosaico[0]?.url || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&h=1000&fit=crop&auto=format&q=80'} onReplace={u => handleMosaicoReplace(0, u)} readOnly={readOnly} className="w-full h-full" />
        </div>
        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-sm">
          <EditableImage siteId={site.id} src={mosaico[1]?.url || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=500&h=500&fit=crop&auto=format&q=80'} onReplace={u => handleMosaicoReplace(1, u)} readOnly={readOnly} className="w-full h-full" />
        </div>
        <div className="col-span-1 row-span-1 relative overflow-hidden rounded-sm">
          <EditableImage siteId={site.id} src={mosaico[2]?.url || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=500&h=500&fit=crop&auto=format&q=80'} onReplace={u => handleMosaicoReplace(2, u)} readOnly={readOnly} className="w-full h-full" />
        </div>
        <div className="col-span-2 row-span-1 relative overflow-hidden rounded-sm">
          <EditableImage siteId={site.id} src={mosaico[3]?.url || 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&h=500&fit=crop&auto=format&q=80'} onReplace={u => handleMosaicoReplace(3, u)} readOnly={readOnly} className="w-full h-full" />
        </div>

        <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:max-w-md z-10 pointer-events-none">
          <div className="pointer-events-auto inline-block">
            <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline" className="text-xs font-bold uppercase tracking-widest text-white/90 mb-2 drop-shadow block" onSave={fieldSaver('tagline')} />
            <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(26px,5vw,42px)] leading-[1.1] text-white drop-shadow-lg block" onSave={fieldSaver('hero_title')} multiline />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-center mb-10">Especialidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {servicos.map(s => (
            <div key={s.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 flex flex-col justify-end p-4">
              <EditableServicoRow
                siteId={site.id} servico={s} readOnly={readOnly}
                onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
                showIcon={false}
                titleClassName="font-display font-bold text-sm text-[#1e293b] mb-1 block"
                descClassName="text-[11px] text-[#1e293b]/70 leading-tight block"
              />
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '', title: 'Nova especialidade', description: 'Descrição' }); if (c) setServicos(list => [...list, c as Servico]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand)]"
          >
            + Adicionar especialidade
          </button>
        )}
      </section>

      <FotoPoolSection siteId={site.id} fotos={restoFotos} readOnly={readOnly} title="Mais fotos do portfólio" />

      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-black/55 z-10" />
        <EditableImage siteId={site.id} src={mosaico[0]?.url || ''} onReplace={u => handleMosaicoReplace(0, u)} readOnly className="absolute inset-0" />
        <div className="relative z-20 max-w-lg mx-auto text-center">
          {depoimento ? (
            <EditableDepoimentoCard
              siteId={site.id} depoimento={depoimento} readOnly={readOnly}
              onUpdate={setDepoimento} onDelete={() => setDepoimento(null)}
              textClassName="font-display text-xl sm:text-2xl text-white leading-snug mb-4 block"
              nameClassName="text-sm text-white/70 block"
            />
          ) : !readOnly ? (
            <button
              onClick={async () => setDepoimento((await upsertDepoimentoInline(site.id, null, { nome: 'Nome do cliente', texto: 'O que o cliente disse' })) as Depoimento)}
              className="text-sm font-semibold text-white underline"
            >
              + Adicionar depoimento
            </button>
          ) : null}
        </div>
      </section>

      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center`}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4"><EditableText as="span" readOnly={readOnly} value={site.cta_heading || "Vamos criar algo juntos?"} onSave={fieldSaver('cta_heading')} /></h2>
          <span className="inline-flex items-center gap-2 bg-white text-[#1e293b] font-bold px-7 py-3.5 rounded-xl" title="No site publicado, isso abre o WhatsApp">
            💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
          </span>
        </div>
      </section>
    </div>
  )
}
