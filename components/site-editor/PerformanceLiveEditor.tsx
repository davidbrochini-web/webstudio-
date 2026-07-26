'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import FotoPoolSection, { type Foto } from '@/components/site-editor/FotoPoolSection'
import { EditableServicoRow, type Servico } from '@/components/site-editor/EditableServicoRow'
import { EditableStat, addStat, type Stat } from '@/components/site-editor/EditableStat'
import { EditableDepoimentoCard, type Depoimento } from '@/components/site-editor/EditableDepoimentoCard'
import { updateSiteField, replaceFoto, addFotoToPool, upsertServicoInline, upsertDepoimentoInline } from '@/app/app/editor/actions'

const ACCENT = 'from-[#4ade80] to-[#22c55e]'

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

export default function PerformanceLiveEditor({ site, servicos: servicosInit, fotos: fotosInit, depoimentos: depoimentosInit, stats: statsInit, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimentos: Depoimento[]
  stats: Stat[]
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [fotos, setFotos] = useState(fotosInit)
  const [depoimentos, setDepoimentos] = useState(depoimentosInit)
  const [stats, setStats] = useState(statsInit)

  const ctaLabel = site.cta_label || 'Fale conosco'
  const fieldSaver = (field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label' | 'cta_heading' | 'cta_subtext') => (v: string) => updateSiteField(site.id, field, v)
  const heroFoto = fotos[0]
  const heroStat = stats[0]
  const gridStats = stats.slice(1)

  return (
    <div className="bg-[#0A0F0D] text-white">
      <nav className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg" onSave={fieldSaver('business_name')} />
        <span className={`bg-gradient-to-r ${ACCENT} text-[#0A0F0D] text-sm font-extrabold px-4 py-2 rounded-full`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      <section className="relative px-6 py-20 sm:py-28 overflow-hidden">
        <EditableImage
          siteId={site.id}
          src={heroFoto?.url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=900&fit=crop&auto=format&q=80'}
          onReplace={async url => {
            if (heroFoto) { await replaceFoto(heroFoto.id, url); setFotos(fs => fs.map(f => (f.id === heroFoto.id ? { ...f, url } : f))) }
            else { const c = await addFotoToPool(site.id, url); if (c) setFotos(fs => [c, ...fs]) }
          }}
          readOnly={readOnly}
          className="absolute inset-0 opacity-25"
          badge="foto de fundo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0D] via-[#0A0F0D]/70 to-[#0A0F0D]/40 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline" className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-3 block" onSave={fieldSaver('tagline')} />
          <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(28px,6vw,48px)] leading-[1.08] mb-3 block" onSave={fieldSaver('hero_title')} multiline />

          {heroStat && (
            <div className="my-8">
              <EditableStat
                siteId={site.id} stat={heroStat} readOnly={readOnly}
                onUpdate={u => setStats(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setStats(list => list.filter(x => x.id !== id))}
                className="inline-block"
                valorClassName={`font-display font-extrabold text-[clamp(60px,15vw,120px)] leading-none bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent block`}
                rotuloClassName="text-sm text-white/50 uppercase tracking-widest block"
              />
            </div>
          )}
          <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-white/60 max-w-lg mx-auto mb-8 block" onSave={fieldSaver('hero_sub')} multiline />
          <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${ACCENT} text-[#0A0F0D] font-extrabold px-8 py-4 rounded-full`} title="No site publicado, isso abre o WhatsApp">
            <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} /> →
          </span>
        </div>
      </section>

      <section className="px-6 py-10 border-y border-white/10">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-4 text-center">
          {gridStats.map(s => (
            <EditableStat
              key={s.id} siteId={site.id} stat={s} readOnly={readOnly}
              onUpdate={u => setStats(list => list.map(x => (x.id === u.id ? u : x)))}
              onDelete={id => setStats(list => list.filter(x => x.id !== id))}
              valorClassName={`font-display font-extrabold text-2xl sm:text-3xl bg-gradient-to-r ${ACCENT} bg-clip-text text-transparent block`}
              rotuloClassName="text-[11px] text-white/40 uppercase tracking-wide block"
            />
          ))}
          {!readOnly && (
            <button
              onClick={async () => { const c = await addStat(site.id, '+10', 'novo número'); if (c) setStats(list => [...list, c as Stat]) }}
              className="text-white/40 hover:text-white text-xs font-semibold self-center px-3 py-1 border border-white/20 rounded-full"
            >
              + número
            </button>
          )}
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20 max-w-2xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-center mb-8">Nossa ficha de treino</h2>
        <div className="flex flex-col gap-5">
          {servicos.map(s => (
            <EditableServicoRow
              key={s.id} siteId={site.id} servico={s} readOnly={readOnly}
              onUpdate={u => setServicos(list => list.map(x => (x.id === u.id ? u : x)))}
              onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
              iconClassName="text-lg"
              titleClassName="font-display font-bold text-sm block"
              descClassName="text-xs text-white/40 block ml-8"
            />
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertServicoInline(site.id, null, { icon: '💪', title: 'Novo treino', description: 'Descrição' }); if (c) setServicos(list => [...list, c as Servico]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand-bright)]"
          >
            + Adicionar treino
          </button>
        )}
      </section>

      <FotoPoolSection siteId={site.id} fotos={fotos} readOnly={readOnly} />

      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {depoimentos.map(d => (
            <div key={d.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <EditableDepoimentoCard
                siteId={site.id} depoimento={d} readOnly={readOnly}
                onUpdate={u => setDepoimentos(list => list.map(x => (x.id === u.id ? u : x)))}
                onDelete={id => setDepoimentos(list => list.filter(x => x.id !== id))}
                textClassName="text-sm text-white/70 leading-relaxed mb-3 block"
                nameClassName="text-xs font-bold text-white/40 block"
              />
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => { const c = await upsertDepoimentoInline(site.id, null, { nome: 'Nome do aluno', texto: 'Resultado alcançado' }); if (c) setDepoimentos(list => [...list, c as Depoimento]) }}
            className="mt-5 text-sm font-semibold text-[var(--brand-bright)]"
          >
            + Adicionar depoimento
          </button>
        )}
      </section>

      <section className="px-6 py-16 text-center border-t border-white/10">
        <h2 className="font-display font-extrabold text-2xl mb-6"><EditableText as="span" readOnly={readOnly} value={site.cta_heading || "Sua transformação começa hoje"} onSave={fieldSaver('cta_heading')} /></h2>
        <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${ACCENT} text-[#0A0F0D] font-extrabold px-8 py-4 rounded-full`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} /> →
        </span>
      </section>
    </div>
  )
}
