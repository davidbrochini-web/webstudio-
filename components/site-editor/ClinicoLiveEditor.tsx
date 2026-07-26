'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import {
  updateSiteField, replaceFoto, addFotoToPool, deleteFotoFromPool,
  upsertServicoInline, deleteServicoInline, upsertDepoimentoInline,
  upsertStatInline, deleteStatInline,
} from '@/app/app/editor/actions'


export interface Servico { id: string; icon: string; title: string; description: string }
export interface Foto { id: string; url: string }
export interface Depoimento { id: string; nome: string; texto: string }
export interface Stat { id: string; valor: string; rotulo: string }

export interface SiteData {
  id: string
  business_name: string
  tagline: string
  hero_title: string
  hero_sub: string
  cta_label: string
  cta_heading: string | null
  cta_subtext: string | null
  whatsapp: string | null
  instagram_handle: string | null
}

function ServicoRow({ siteId, servico, readOnly, onUpdate, onDelete }: {
  siteId: string
  servico: Servico
  readOnly: boolean
  onUpdate: (s: Servico) => void
  onDelete: (id: string) => void
}) {
  const [erro, setErro] = useState<string | null>(null)
  return (
    <div className="flex items-center gap-4 py-5 group">
      <EditableText
        as="span" readOnly={readOnly}
        value={servico.icon}
        className="text-2xl w-10 text-center flex-shrink-0"
        onSave={async v => { const r = await upsertServicoInline(siteId, servico.id, { icon: v, title: servico.title, description: servico.description }); onUpdate(r as Servico) }}
      />
      <div className="flex-1 min-w-0">
        <EditableText
          as="h3" readOnly={readOnly}
          value={servico.title}
          className="font-display font-bold text-base text-[var(--ink)] block"
          onSave={async v => { const r = await upsertServicoInline(siteId, servico.id, { icon: servico.icon, title: v, description: servico.description }); onUpdate(r as Servico) }}
        />
        <EditableText
          as="p" readOnly={readOnly}
          value={servico.description}
          className="text-sm text-[var(--muted)] block"
          onSave={async v => { const r = await upsertServicoInline(siteId, servico.id, { icon: servico.icon, title: servico.title, description: v }); onUpdate(r as Servico) }}
        />
        {erro && <p className="text-xs text-red-600">{erro}</p>}
      </div>
      {!readOnly && (
        <button
          onClick={async () => { try { await deleteServicoInline(servico.id); onDelete(servico.id) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover') } }}
          className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-[var(--muted)] hover:text-red-600 flex-shrink-0 transition-opacity"
        >
          Remover
        </button>
      )}
    </div>
  )
}

export default function ClinicoLiveEditor({ site, servicos: servicosInit, fotos: fotosInit, depoimento: depoimentoInit, stats: statsInit, accent, solidBg, readOnly }: {
  site: SiteData
  servicos: Servico[]
  fotos: Foto[]
  depoimento: Depoimento | null
  stats: Stat[]
  accent: string
  solidBg: string
  readOnly: boolean
}) {
  const [servicos, setServicos] = useState(servicosInit)
  const [fotos, setFotos] = useState(fotosInit)
  const [depoimento, setDepoimento] = useState(depoimentoInit)
  const [stats, setStats] = useState(statsInit)
  const [addingFoto, setAddingFoto] = useState(false)

  const heroFoto = fotos[0]
  const ctaLabel = site.cta_label || 'Fale conosco'

  function fieldSaver(field: 'business_name' | 'tagline' | 'hero_title' | 'hero_sub' | 'cta_label' | 'cta_heading' | 'cta_subtext') {
    return (v: string) => updateSiteField(site.id, field, v)
  }

  async function handleHeroFotoReplace(url: string) {
    if (heroFoto) {
      await replaceFoto(heroFoto.id, url)
      setFotos(fs => fs.map(f => (f.id === heroFoto.id ? { ...f, url } : f)))
    } else {
      const created = await addFotoToPool(site.id, url)
      if (created) setFotos(fs => [created, ...fs])
    }
  }

  async function handleAddFoto(url: string) {
    setAddingFoto(true)
    try {
      const created = await addFotoToPool(site.id, url)
      if (created) setFotos(fs => [...fs, created])
    } finally {
      setAddingFoto(false)
    }
  }

  return (
    <div className="bg-white text-[#1e293b]">
      {/* Nav */}
      <nav className="border-b border-gray-200 px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
        <EditableText as="span" readOnly={readOnly} value={site.business_name} className="font-display font-extrabold text-lg" onSave={fieldSaver('business_name')} />
        <span className={`${solidBg} text-white text-sm font-semibold px-4 py-2 rounded-lg`} title="No site publicado, isso abre o WhatsApp">
          <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
        </span>
      </nav>

      {/* Hero split */}
      <section className="px-6 py-16 sm:py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <EditableText as="p" readOnly={readOnly} value={site.tagline} placeholder="Tagline (ex: Clínica odontológica)" className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 block" onSave={fieldSaver('tagline')} />
            <EditableText as="h1" readOnly={readOnly} value={site.hero_title} className="font-display font-extrabold text-[clamp(30px,5vw,48px)] leading-[1.12] mb-5 block" onSave={fieldSaver('hero_title')} multiline />
            <EditableText as="p" readOnly={readOnly} value={site.hero_sub} className="text-base text-gray-500 leading-relaxed max-w-md mb-8 block" onSave={fieldSaver('hero_sub')} multiline />
            <span className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-xl" title="No site publicado, isso abre o WhatsApp">
              💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
            </span>
          </div>
          <div className="relative">
            <div className={`absolute -inset-3 rounded-[28px] bg-gradient-to-br ${accent} opacity-15 blur-xl`} />
            <EditableImage
              siteId={site.id}
              src={heroFoto?.url || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop&auto=format&q=80'}
              onReplace={handleHeroFotoReplace}
              readOnly={readOnly}
              className="relative aspect-[4/3] w-full rounded-3xl shadow-xl overflow-hidden"
              badge="foto principal"
            />
          </div>
        </div>
      </section>

      {/* Barra de confiança — agora editável */}
      <div className={`bg-gradient-to-r ${accent} py-5`}>
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-x-4 gap-y-3 text-center">
          {stats.map(s => (
            <div key={s.id} className="relative group px-2">
              <EditableText
                as="span" readOnly={readOnly}
                value={s.valor}
                className="font-display font-extrabold text-xl sm:text-2xl text-white block"
                onSave={async v => { const r = await upsertStatInline(site.id, s.id, { valor: v, rotulo: s.rotulo }); setStats(list => list.map(x => (x.id === s.id ? (r as Stat) : x))) }}
              />
              <EditableText
                as="span" readOnly={readOnly}
                value={s.rotulo}
                className="text-[11px] sm:text-xs text-white/80 block"
                onSave={async v => { const r = await upsertStatInline(site.id, s.id, { valor: s.valor, rotulo: v }); setStats(list => list.map(x => (x.id === s.id ? (r as Stat) : x))) }}
              />
              {!readOnly && (
                <button
                  onClick={async () => { await deleteStatInline(s.id); setStats(list => list.filter(x => x.id !== s.id)) }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/30 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remover"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button
              onClick={async () => {
                const created = await upsertStatInline(site.id, null, { valor: '+100', rotulo: 'clientes atendidos' })
                if (created) setStats(list => [...list, created as Stat])
              }}
              className="text-white/70 hover:text-white text-xs font-semibold self-center px-3 py-1 border border-white/30 rounded-full"
            >
              + número
            </button>
          )}
        </div>
      </div>

      {/* Serviços */}
      <section className="px-6 py-16 sm:py-20 max-w-3xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-center mb-10">O que oferecemos</h2>
        <div className="flex flex-col divide-y divide-gray-200 border-y border-gray-200">
          {servicos.map(s => (
            <ServicoRow
              key={s.id} siteId={site.id} servico={s} readOnly={readOnly}
              onUpdate={updated => setServicos(list => list.map(x => (x.id === updated.id ? updated : x)))}
              onDelete={id => setServicos(list => list.filter(x => x.id !== id))}
            />
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={async () => {
              const created = await upsertServicoInline(site.id, null, { icon: '✨', title: 'Novo serviço', description: 'Descrição do serviço' })
              if (created) setServicos(list => [...list, created as Servico])
            }}
            className="mt-5 text-sm font-semibold text-[var(--brand)]"
          >
            + Adicionar serviço
          </button>
        )}
      </section>

      {/* Fotos (pool usada no hero e no feed simulado) */}
      <section className="px-6 py-10 sm:py-14 bg-[var(--off)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-lg mb-1">Fotos do seu negócio</h2>
          <p className="text-sm text-gray-500 mb-5">
            A primeira é a foto principal do site. As demais aparecem no feed de demonstração do Instagram.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {fotos.map((f, i) => (
              <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <EditableImage
                  siteId={site.id}
                  src={f.url}
                  onReplace={async url => { await replaceFoto(f.id, url); setFotos(fs => fs.map(x => (x.id === f.id ? { ...x, url } : x))) }}
                  readOnly={readOnly}
                  className="w-full h-full"
                  badge={i === 0 ? 'principal' : undefined}
                />
                {!readOnly && (
                  <button
                    onClick={async () => { await deleteFotoFromPool(f.id); setFotos(fs => fs.filter(x => x.id !== f.id)) }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Remover foto"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-semibold cursor-pointer hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors">
                {addingFoto ? 'Enviando...' : '+ Adicionar'}
                <input
                  type="file" accept="image/*" className="hidden" disabled={addingFoto}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setAddingFoto(true)
                    try {
                      const { uploadSiteFoto } = await import('@/lib/storage')
                      const url = await uploadSiteFoto(site.id, file)
                      await handleAddFoto(url)
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Erro ao enviar foto.')
                    } finally {
                      setAddingFoto(false)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Depoimento em destaque */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-3xl mb-4">⭐⭐⭐⭐⭐</div>
          {depoimento ? (
            <>
              <EditableText
                as="div" readOnly={readOnly}
                value={depoimento.texto}
                className="font-display text-xl sm:text-2xl leading-snug mb-5 block"
                multiline
                onSave={async v => { const r = await upsertDepoimentoInline(site.id, depoimento.id, { nome: depoimento.nome, texto: v }); setDepoimento(r as Depoimento) }}
              />
              <EditableText
                as="p" readOnly={readOnly}
                value={depoimento.nome}
                className="text-sm font-semibold text-gray-500"
                onSave={async v => { const r = await upsertDepoimentoInline(site.id, depoimento.id, { nome: v, texto: depoimento.texto }); setDepoimento(r as Depoimento) }}
              />
            </>
          ) : !readOnly ? (
            <button
              onClick={async () => {
                const created = await upsertDepoimentoInline(site.id, null, { nome: 'Nome do cliente', texto: 'O que o cliente disse sobre você' })
                setDepoimento(created as Depoimento)
              }}
              className="text-sm font-semibold text-[var(--brand)]"
            >
              + Adicionar depoimento
            </button>
          ) : (
            <p className="text-sm text-gray-400">Nenhum depoimento ainda.</p>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className={`bg-gradient-to-br ${accent} px-6 py-16 sm:py-20 text-center`}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-4"><EditableText as="span" readOnly={readOnly} value={site.cta_heading || "Agende sua avaliação"} onSave={fieldSaver('cta_heading')} /></h2>
          <p className="text-white/85 mb-8"><EditableText as="span" readOnly={readOnly} value={site.cta_subtext || "Atendimento rápido pelo WhatsApp — sem compromisso."} onSave={fieldSaver('cta_subtext')} /></p>
          <span className="inline-flex items-center gap-2 bg-white text-[#1e293b] font-bold px-7 py-3.5 rounded-xl" title="No site publicado, isso abre o WhatsApp">
            💬 <EditableText as="span" readOnly={readOnly} value={ctaLabel} onSave={fieldSaver('cta_label')} />
          </span>
        </div>
      </section>
    </div>
  )
}
