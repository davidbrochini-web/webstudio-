'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import FotoPoolSection, { type Foto } from '@/components/site-editor/FotoPoolSection'
import { EditableServicoRow, type Servico } from '@/components/site-editor/EditableServicoRow'
import { EditableStat, addStat, type Stat } from '@/components/site-editor/EditableStat'
import { EditableDepoimentoCard, type Depoimento } from '@/components/site-editor/EditableDepoimentoCard'
import { updateSiteField, replaceFoto, addFotoToPool, upsertServicoInline, upsertDepoimentoInline } from '@/app/app/editor/actions'

const ACCENT = 'from-[#7C3AED] to-[#A855F7]'

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

export default function EditorialLiveEditor({ site, servicos: servicosInit, fotos: fotosInit, depoimento: depoimentoInit, stats: statsInit, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimento: Depoimento | null
  stats: Stat[]
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [depoimento, setDepoimento] = useState(depoimentoInit)
  const [stats, setStats] = useState(statsInit)

  const officeFoto = fotosInit[0]
  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label' | 'cta_heading' | 'cta_subtext') => (v: string) => updateSiteField(site.id, field, v)

  return (
    <div className="bg-[#0B0F14] text-white">
      <nav className="border-b border-white/10 px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg" onSave={fieldSaver('business_name')} />
        <span className="border border-white/25 text-sm font-semibold px-4 py-2 rounded">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="px-6 pt-20 pb-14 max-w-4xl mx-auto">
        <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline (ex: Escritório de advocacia)" className={`text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent mb-6 block`} onSave={fieldSaver('tagline')} />
        <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(32px,6vw,54px)] leading-[1.08] mb-6 max-w-2xl block" onSave={fieldSaver('hero_title')} multiline />
        <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-white/55 leading-relaxed max-w-lg mb-8 block" onSave={fieldSaver('hero_sub')} multiline />
        <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${ACCENT} font-bold px-6 py-3 rounded`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} /> →
        </span>
      </section>

      <section className="px-6 py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Índice</p>
            <p className="font-display font-bold text-lg">Áreas de atuação</p>
          </div>
          <div className="flex flex-col divide-y divide-white/10">
            {servicos.map((s, i) => (
              <div key={s.id} className="flex gap-5 py-6">
                <span className="font-display text-white/25 text-2xl w-8 flex-shrink-0">0{i + 1}</span>
                <EditableServicoRow
                  siteId={site.id} servico={s} readOnly={readOnly}
                  onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
                  onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
                  className="flex-1"
                  titleClassName="font-display font-bold text-base text-white mb-1.5 block"
                  descClassName="text-sm text-white/50 leading-relaxed block"
                  showIcon={false}
                />
              </div>
            ))}
          </div>
        </div>
        {!readOnly && (
          <div className="max-w-4xl mx-auto mt-4 pl-[180px] sm:pl-[190px]">
            <button
              onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '', title: 'Nova área', description: 'Descrição' }); if (c) setServicos(list => [...list, c as Servico]) }}
              className="text-sm font-semibold text-[var(--brand-bright)]"
            >
              + Adicionar área de atuação
            </button>
          </div>
        )}
      </section>

      <div className="border-y border-white/10 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-center">
          {stats.map(s => (
            <EditableStat
              key={s.id} siteId={site.id} stat={s} readOnly={readOnly}
              onUpdate={u => setStats(list => list.map(x => (x.id === u.id ? u : x)))}
              onDelete={id => setStats(list => list.filter(x => x.id !== id))}
              valorClassName={`font-display font-extrabold text-xl sm:text-2xl bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent block`}
              rotuloClassName="text-[11px] text-white/40 block"
            />
          ))}
          {!readOnly && (
            <button
              onClick={async () => { const c = await addStat(site.id, '+10', 'novo número'); if (c) setStats(list => [...list, c as Stat]) }}
              className="text-white/50 hover:text-white text-xs font-semibold self-center px-3 py-1 border border-white/20 rounded-full"
            >
              + número
            </button>
          )}
        </div>
      </div>

      <section className="px-6 py-16 max-w-4xl mx-auto">
        <EditableImage
          siteId={site.id}
          src={officeFoto?.url || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=500&fit=crop&auto=format&q=80'}
          onReplace={async url => {
            if (officeFoto) { await replaceFoto(officeFoto.id, url) } else { await addFotoToPool(site.id, url) }
          }}
          readOnly={readOnly}
          className="w-full aspect-[21/9] rounded-sm overflow-hidden"
          badge="foto do escritório"
        />
      </section>

      <FotoPoolSection siteId={site.id} fotos={fotosInit.slice(1)} readOnly={readOnly} title="Mais fotos" hint="Aparecem no feed de demonstração do Instagram." />

      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          <p className="text-4xl text-white/20 font-display leading-none mb-4">&ldquo;</p>
          {depoimento ? (
            <EditableDepoimentoCard
              siteId={site.id} depoimento={depoimento} readOnly={readOnly}
              onUpdate={setDepoimento} onDelete={() => setDepoimento(null)}
              textClassName="text-lg text-white/70 leading-relaxed italic mb-6 block"
              nameClassName="text-sm font-semibold text-white/40 block"
            />
          ) : !readOnly ? (
            <button
              onClick={async () => setDepoimento((await upsertDepoimentoInline(site.id, null, { nome: 'Nome do cliente', texto: 'O que o cliente disse' })) as Depoimento)}
              className="text-sm font-semibold text-[var(--brand-bright)]"
            >
              + Adicionar depoimento
            </button>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-16 border-t border-white/10 text-center">
        <h2 className="font-display font-extrabold text-2xl mb-4"><EditableText as="span" readOnly={readOnly} value={site.cta_heading || "Converse com nosso time"} onSave={fieldSaver('cta_heading')} /></h2>
        <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${ACCENT} font-bold px-7 py-3.5 rounded`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} /> →
        </span>
      </section>
    </div>
  )
}
