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
  hero_sub: string
  cta_label: string
}

export default function ZenLiveEditor({ site, servicos: servicosInit, fotos: fotosInit, depoimento: depoimentoInit, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimento: Depoimento | null
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [fotos, setFotos] = useState(fotosInit)
  const [depoimento, setDepoimento] = useState(depoimentoInit)

  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label') => (v: string) => updateSiteField(site.id, field, v)
  const heroFoto = fotos[0]

  return (
    <div className="bg-[#FAF7F2] text-[#4A5548]">
      <nav className="px-6 h-20 flex items-center justify-between max-w-6xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display text-lg tracking-wide" onSave={fieldSaver('business_name')} />
        <span className="text-sm text-[#8B7355] font-medium underline underline-offset-4" title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
          <div className="lg:pr-6">
            <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline" className="text-xs uppercase tracking-[0.3em] text-[#8B7355] mb-6 block" onSave={fieldSaver('tagline')} />
            <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display text-[clamp(30px,5vw,46px)] leading-[1.25] mb-6 font-normal block" onSave={fieldSaver('hero_title')} multiline />
            <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-[#6B7565] leading-loose mb-8 max-w-md block" onSave={fieldSaver('hero_sub')} multiline />
            <span className="inline-flex items-center gap-2 bg-[#4A5548] text-white font-medium px-8 py-4 rounded-full" title="No site publicado, isso abre o WhatsApp">
              <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
            </span>
          </div>
          <div className="relative">
            <EditableImage
              siteId={site.id}
              src={heroFoto?.url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&h=1100&fit=crop&auto=format&q=80'}
              onReplace={async url => {
                if (heroFoto) { await replaceFoto(heroFoto.id, url); setFotos(fs => fs.map(f => (f.id === heroFoto.id ? { ...f, url } : f))) }
                else { const c = await addFotoToPool(site.id, url); if (c) setFotos(fs => [c, ...fs]) }
              }}
              readOnly={readOnly}
              className="w-full aspect-[4/5] rounded-[32px] shadow-lg overflow-hidden"
              badge="foto principal"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl text-center mb-12 font-normal">Nossos tratamentos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {servicos.map(s => (
            <div key={s.id} className="flex gap-5 items-center bg-white rounded-[28px] p-5 shadow-sm">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex-shrink-0 bg-[#EFE9E0]" />
              <EditableServicoRow
                siteId={site.id} servico={s} readOnly={readOnly}
                onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
                className="flex-1"
                titleClassName="font-display text-lg mb-1.5 block"
                descClassName="text-sm text-[#6B7565] leading-relaxed block"
              />
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '🌿', title: 'Novo tratamento', description: 'Descrição' }); if (c) setServicos(list => [...list, c as Servico]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand)]"
          >
            + Adicionar tratamento
          </button>
        )}
      </section>

      <FotoPoolSection siteId={site.id} fotos={fotos.slice(1)} readOnly={readOnly} />

      <section className="px-6 py-20 max-w-xl mx-auto text-center">
        <p className="text-4xl text-[#8B7355]/30 font-display leading-none mb-3">&ldquo;</p>
        {depoimento ? (
          <EditableDepoimentoCard
            siteId={site.id} depoimento={depoimento} readOnly={readOnly}
            onUpdate={setDepoimento} onDelete={() => setDepoimento(null)}
            textClassName="font-display text-xl leading-relaxed italic mb-5 block"
            nameClassName="text-sm text-[#8B7355] block"
          />
        ) : !readOnly ? (
          <button
            onClick={async () => setDepoimento((await upsertDepoimentoInline(site.id, null, { nome: 'Nome do cliente', texto: 'O que o cliente disse' })) as Depoimento)}
            className="text-sm font-semibold text-[#8B7355] underline"
          >
            + Adicionar depoimento
          </button>
        ) : null}
      </section>

      <section className="px-6 py-20 text-center bg-[#4A5548]">
        <p className="text-lg text-white/80 mb-2">Reserve um momento só seu.</p>
        <p className="text-sm text-white/50 mb-8 max-w-sm mx-auto">Agende sua sessão e sinta a diferença de um cuidado de verdade.</p>
        <span className="inline-flex items-center gap-2 bg-white text-[#4A5548] font-semibold px-8 py-4 rounded-full" title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </section>
    </div>
  )
}
