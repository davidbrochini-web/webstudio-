'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import FotoPoolSection, { type Foto } from '@/components/site-editor/FotoPoolSection'
import { EditableServicoRow, type Servico } from '@/components/site-editor/EditableServicoRow'
import { EditableDepoimentoCard, type Depoimento } from '@/components/site-editor/EditableDepoimentoCard'
import { updateSiteField, upsertServicoInline, upsertDepoimentoInline } from '@/app/app/editor/actions'

const ACCENT = 'from-[#3b82f6] to-[#1d4ed8]'

export interface SiteData {
  id: string
  business_name: string
  tagline: string
  hero_title: string
  hero_sub: string
  cta_label: string
}

export default function AcolhedorLiveEditor({ site, servicos: servicosInit, fotos, depoimentos: depoimentosInit, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimentos: Depoimento[]
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [depoimentos, setDepoimentos] = useState(depoimentosInit)

  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label') => (v: string) => updateSiteField(site.id, field, v)

  return (
    <div className="bg-white text-[#1e293b]">
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg" onSave={fieldSaver('business_name')} />
        <span className={`bg-gradient-to-r ${ACCENT} text-white text-sm font-semibold px-5 py-2.5 rounded-full`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="relative px-6 pt-12 pb-10 overflow-hidden">
        <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${ACCENT} opacity-15 blur-3xl pointer-events-none`} />
        <div className={`absolute top-32 -left-20 w-64 h-64 rounded-full bg-gradient-to-br ${ACCENT} opacity-15 blur-3xl pointer-events-none`} />
        <div className="relative max-w-xl mx-auto text-center">
          <EditableText as="span" readOnly={readOnly} value={site.tagline} placeholder="Tagline" className={`inline-block text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent mb-4`} onSave={fieldSaver('tagline')} />
          <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(28px,6vw,46px)] leading-[1.15] mb-5 block" onSave={fieldSaver('hero_title')} multiline />
          <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-[var(--muted)] leading-relaxed max-w-md mx-auto mb-8 block" onSave={fieldSaver('hero_sub')} multiline />
          <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${ACCENT} text-white font-bold px-7 py-3.5 rounded-full`} title="No site publicado, isso abre o WhatsApp">
            💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
          </span>
        </div>
      </section>

      <section className="px-6 py-14 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {servicos.map(s => (
            <div key={s.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[28px] overflow-hidden">
              <div className="w-full aspect-[16/9] bg-[var(--off)]" />
              <div className="p-6">
                <EditableServicoRow
                  siteId={site.id} servico={s} readOnly={readOnly}
                  onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
                  onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
                  titleClassName="font-display font-bold text-base mb-1.5 block"
                  descClassName="text-sm text-[var(--muted)] leading-relaxed block"
                />
              </div>
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '📘', title: 'Novo curso', description: 'Descrição' }); if (c) setServicos(list => [...list, c as Servico]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand)]"
          >
            + Adicionar curso
          </button>
        )}
      </section>

      <FotoPoolSection siteId={site.id} fotos={fotos} readOnly={readOnly} />

      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {depoimentos.map(d => (
            <div key={d.id} className="bg-[var(--off)] rounded-3xl p-6">
              <div className="flex gap-0.5 mb-3 text-sm">{'⭐'.repeat(5)}</div>
              <EditableDepoimentoCard
                siteId={site.id} depoimento={d} readOnly={readOnly}
                onUpdate={u => setDepoimentos(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setDepoimentos(list => list.filter(x => x.id !== id))}
                textClassName="text-sm text-[var(--slate)] leading-relaxed mb-3 block"
                nameClassName="text-xs font-bold text-[var(--muted)] block"
              />
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertDepoimentoInline(site.id, null, { nome: 'Nome do aluno', texto: 'O que ele disse' }); if (c) setDepoimentos(list => [...list, c as Depoimento]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand)]"
          >
            + Adicionar depoimento
          </button>
        )}
      </section>

      <section className={`bg-gradient-to-br ${ACCENT} px-6 py-16 sm:py-20 text-center rounded-t-[40px]`}>
        <div className="max-w-lg mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-6">Vem fazer parte!</h2>
          <span className="inline-flex items-center gap-2 bg-white text-[#1e293b] font-bold px-8 py-4 rounded-full" title="No site publicado, isso abre o WhatsApp">
            💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
          </span>
        </div>
      </section>
    </div>
  )
}
