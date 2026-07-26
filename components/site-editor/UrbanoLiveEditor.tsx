'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import FotoPoolSection, { type Foto } from '@/components/site-editor/FotoPoolSection'
import { EditableServicoRow, type Servico } from '@/components/site-editor/EditableServicoRow'
import { EditableDepoimentoCard, type Depoimento } from '@/components/site-editor/EditableDepoimentoCard'
import { updateSiteField, upsertServicoInline, upsertDepoimentoInline } from '@/app/app/editor/actions'

const ACCENT = 'from-[#f59e0b] to-[#ea580c]'

export interface SiteData {
  id: string
  business_name: string
  tagline: string
  hero_title: string
  hero_sub: string
  cta_label: string
  cta_heading: string | null
  cta_subtext: string | null
}

export default function UrbanoLiveEditor({ site, servicos: servicosInit, fotos, depoimento: depoimentoInit, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimento: Depoimento | null
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [depoimento, setDepoimento] = useState(depoimentoInit)

  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label' | 'cta_heading' | 'cta_subtext') => (v: string) => updateSiteField(site.id, field, v)

  return (
    <div className="bg-[#18181B] text-white">
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg" onSave={fieldSaver('business_name')} />
        <span className={`bg-gradient-to-r ${ACCENT} text-sm font-bold px-4 py-2 rounded`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${ACCENT} opacity-90`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 62%, 0 100%)' }} />
        <div className="relative px-6 pt-16 pb-28 max-w-2xl mx-auto text-center">
          <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline" className="text-xs font-bold uppercase tracking-[0.25em] text-white/80 mb-4 block" onSave={fieldSaver('tagline')} />
          <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(30px,6vw,50px)] leading-[1.05] mb-5 block" onSave={fieldSaver('hero_title')} multiline />
          <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-white/85 leading-relaxed mb-8 block" onSave={fieldSaver('hero_sub')} multiline />
          <span className="inline-flex items-center gap-2 bg-white text-[#18181B] font-bold px-7 py-3.5 rounded" title="No site publicado, isso abre o WhatsApp">
            <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} /> →
          </span>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20 max-w-2xl mx-auto -mt-10 relative">
        <div className="bg-[#27272A] rounded-2xl p-6 sm:p-8">
          <h2 className="font-display font-extrabold text-xl mb-6 text-center uppercase tracking-wide">Nossos serviços</h2>
          <div className="flex flex-col divide-y divide-white/10">
            {servicos.map(s => (
              <EditableServicoRow
                key={s.id} siteId={site.id} servico={s} readOnly={readOnly}
                onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
                className="py-4"
                iconClassName="text-xl flex-shrink-0"
                titleClassName="font-display font-bold text-sm block"
                descClassName="text-xs text-white/40 block"
                priceClassName={`font-display font-extrabold text-sm bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent flex-shrink-0`}
                showPrice
              />
            ))}
          </div>
          {!readOnly && (
            <button
              onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '💈', title: 'Novo serviço', description: 'Descrição', preco: 'R$ 0' }); if (c) setServicos(list => [...list, c as Servico]) }}
              className="mt-4 text-sm font-semibold text-white/60 hover:text-white"
            >
              + Adicionar serviço
            </button>
          )}
        </div>
      </section>

      <FotoPoolSection siteId={site.id} fotos={fotos} readOnly={readOnly} />

      <section className="px-6 py-16 sm:py-20 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-2xl mb-4">🔥</p>
          {depoimento ? (
            <EditableDepoimentoCard
              siteId={site.id} depoimento={depoimento} readOnly={readOnly}
              onUpdate={setDepoimento} onDelete={() => setDepoimento(null)}
              textClassName="text-lg text-white/80 leading-relaxed mb-4 block"
              nameClassName="text-sm font-semibold text-white/40 block"
            />
          ) : !readOnly ? (
            <button
              onClick={async () => setDepoimento((await upsertDepoimentoInline(site.id, null, { nome: 'Nome do cliente', texto: 'O que o cliente disse' })) as Depoimento)}
              className="text-sm font-semibold text-white/60 hover:text-white"
            >
              + Adicionar depoimento
            </button>
          ) : null}
        </div>
      </section>

      <section className={`bg-gradient-to-r ${ACCENT} px-6 py-14 text-center`}>
        <h2 className="font-display font-extrabold text-2xl mb-5"><EditableText as="span" readOnly={readOnly} value={site.cta_heading || "Chega de esperar. Marca aí."} onSave={fieldSaver('cta_heading')} /></h2>
        <span className="inline-flex items-center gap-2 bg-white text-[#18181B] font-bold px-7 py-3.5 rounded" title="No site publicado, isso abre o WhatsApp">
          💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </section>
    </div>
  )
}
