'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContatosBarCE from './ContatosBarCE'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import DiferenciaisSectionEditor, { type Diferencial } from './DiferenciaisSectionEditor'
import SegmentosSectionEditor, { type Segmento } from './SegmentosSectionEditor'
import FaqSectionEditor, { type Faq } from './FaqSectionEditor'
import { texto } from '@/lib/textos-customizados'
import { updateSiteFieldCE } from '@/app/app/(hub)/colegio-elite/actions'

interface SiteDados {
  id: string
  business_name: string
  tagline: string | null
  hero_title: string | null
  hero_sub: string | null
  hero_imagem_url: string | null
  logo_url: string | null
  logo_posicao: 'esquerda' | 'centro'
  telefone: string | null
  whatsapp: string | null
  instagram_handle: string | null
  instagram_visivel: boolean
  endereco: string | null
  status: 'rascunho' | 'publicado'
  missao: string | null
  visao: string | null
  valores: string | null
  secao_diferenciais_visivel: boolean
  secao_segmentos_visivel: boolean
  secao_faq_visivel: boolean
  textos_customizados: Record<string, string>
  cor_primaria: string
  cor_secundaria: string
}

const PAGINAS = [
  { id: 'home', label: 'Home' },
  { id: 'proposta', label: 'Proposta Pedagógica' },
  { id: 'ensino', label: 'Ensino' },
  { id: 'estrutura', label: 'Estrutura' },
  { id: 'faq', label: 'Dúvidas Frequentes' },
  { id: 'contato', label: 'Contato' },
] as const
type PaginaId = typeof PAGINAS[number]['id']

export default function LiveEditor({
  site, diferenciais, segmentos, faq, readOnly,
}: {
  site: SiteDados
  diferenciais: Diferencial[]
  segmentos: Segmento[]
  faq: Faq[]
  readOnly: boolean
}) {
  const [pagina, setPagina] = useState<PaginaId>('home')

  return (
    <div className="min-h-screen bg-[var(--off)]">
      <div className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
        <Link href="/app/colegio-elite" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] flex-shrink-0">← Painel</Link>
        <p className="text-xs text-[var(--muted)] text-center flex-1 hidden sm:block">
          Navegue pelas páginas do site abaixo e clique em qualquer texto ou foto pra editar
          {!readOnly && ' · as alterações aparecem no site na hora'}
        </p>
        <a
          href="/projetos-especiais/colegio-elite" target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-[var(--ce-primary)] px-3 py-1.5 rounded-lg border border-[var(--ce-primary)]/30 hover:bg-[var(--ce-primary)]/10 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Abrir site →
        </a>
      </div>

      <div className="bg-white border-b border-[var(--border)] sticky top-[49px] z-20 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center px-4 gap-1">
          {PAGINAS.map(p => (
            <button
              key={p.id}
              onClick={() => setPagina(p.id)}
              className={`relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                pagina === p.id ? 'text-[var(--ce-secondary)]' : 'text-slate-400 hover:text-[var(--ce-secondary)]'
              }`}
            >
              {p.label}
              {pagina === p.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--ce-primary)] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <ContatosBarCE
        siteId={site.id}
        telefone={site.telefone} whatsapp={site.whatsapp}
        instagramHandle={site.instagram_handle} instagramVisivel={site.instagram_visivel} endereco={site.endereco}
        status={site.status} readOnly={readOnly}
        defaultExpanded={pagina === 'home' || pagina === 'contato'}
      />

      <div
        className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-white"
        style={{
          '--ce-primary': site.cor_primaria || '#1B3A6B',
          '--ce-secondary': site.cor_secundaria || '#0F1F3D',
        } as React.CSSProperties}
      >
        {pagina === 'home' && (
          <>
            <section className="relative overflow-hidden h-[360px] sm:h-[440px]">
              <EditableImage
                src={site.hero_imagem_url || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=60'}
                siteId={site.id} readOnly={readOnly} aspect={16 / 9} className="absolute inset-0 w-full h-full" alt=""
                badge="Foto do banner"
                onReplace={async (url) => { await updateSiteFieldCE(site.id, 'hero_imagem_url', url) }}
                onRemove={async () => { await updateSiteFieldCE(site.id, 'hero_imagem_url', '') }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--ce-secondary)]/90 via-[var(--ce-secondary)]/55 to-transparent pointer-events-none" />
              <div className="relative h-full max-w-4xl mx-auto px-5 sm:px-6 flex flex-col justify-center">
                <EditableText as="h1" readOnly={readOnly} value={site.hero_title ?? ''} placeholder="Título de destaque"
                  className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3 max-w-xl leading-tight block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'hero_title', v) }} />
                <EditableText as="p" readOnly={readOnly} value={site.hero_sub ?? ''} placeholder="Subtítulo de apoio" multiline
                  className="text-white/85 text-sm sm:text-base max-w-md mb-6 block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'hero_sub', v) }} />
                <div className="self-start">
                  <EditableTextoCustomizado siteId={site.id} chave="nav_cta"
                    valor={texto(site.textos_customizados, 'nav_cta', 'Fale Conosco')}
                    readOnly={readOnly} as="span"
                    className="bg-white text-[var(--ce-secondary)] font-bold px-5 py-2.5 rounded-full text-sm shadow-lg inline-block" />
                </div>
              </div>
            </section>

            <div className="px-6 py-3 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">
                A home também mostra prévias de Diferenciais, Ensino e Dúvidas Frequentes — edite o conteúdo em cada aba acima
              </p>
            </div>

            <section className="px-6 py-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-display font-bold text-2xl text-slate-400 mb-1">Bem-vindo ao</h2>
                <EditableText as="p" readOnly={readOnly} value={site.business_name} placeholder="Nome da escola"
                  className="font-display font-extrabold text-3xl text-[var(--ce-secondary)] mb-4 block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'business_name', v) }} />
                <EditableText as="p" readOnly={readOnly} multiline value={site.tagline ?? ''}
                  placeholder="Texto institucional — conte a filosofia de trabalho da escola"
                  className="text-slate-500 leading-relaxed mb-2 block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'tagline', v) }} />
                <p className="text-xs text-slate-400 mb-5">Esse texto também aparece na página &ldquo;Proposta Pedagógica&rdquo;</p>

                {!readOnly && (
                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Logo do menu</p>
                    <EditableImage
                      src={site.logo_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=60'}
                      siteId={site.id} readOnly={readOnly}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50"
                      alt="Logo" aspect={1}
                      badge={site.logo_url ? undefined : 'Sem logo — mostrando nome'}
                      onReplace={async (url) => { await updateSiteFieldCE(site.id, 'logo_url', url) }}
                      onRemove={site.logo_url ? async () => { await updateSiteFieldCE(site.id, 'logo_url', '') } : undefined}
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="px-6 py-14 text-center bg-[var(--ce-secondary)]">
              <EditableTextoCustomizado siteId={site.id} readOnly={readOnly} chave="home_cta_titulo"
                valor={site.textos_customizados?.home_cta_titulo ?? 'Vamos construir o futuro do seu filho?'}
                as="p" className="font-display font-extrabold text-xl text-white mb-3 block" />
              <span className="inline-block bg-[var(--ce-primary)] text-white font-bold px-6 py-3 rounded-full text-sm opacity-70">Fale Conosco</span>
              <p className="text-white/30 text-[10px] mt-2">Botão fixo — não editável aqui</p>
            </section>
          </>
        )}

        {pagina === 'proposta' && (
          <div className="px-6 py-14 max-w-3xl mx-auto text-center">
            <EditableText as="p" readOnly={readOnly} multiline value={site.tagline ?? ''}
              placeholder="Texto institucional — missão, história, filosofia de trabalho"
              className="text-slate-600 leading-relaxed text-lg block mb-8"
              onSave={async v => { await updateSiteFieldCE(site.id, 'tagline', v) }} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-slate-50 border-l-4 border-[var(--ce-primary)] rounded-r-2xl p-5">
                <p className="font-display font-bold text-[var(--ce-secondary)] text-sm mb-2">Missão</p>
                <EditableText as="p" readOnly={readOnly} multiline value={site.missao ?? ''}
                  placeholder="O propósito da escola" className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'missao', v) }} />
              </div>
              <div className="bg-slate-50 border-l-4 border-[var(--ce-primary)] rounded-r-2xl p-5">
                <p className="font-display font-bold text-[var(--ce-secondary)] text-sm mb-2">Visão</p>
                <EditableText as="p" readOnly={readOnly} multiline value={site.visao ?? ''}
                  placeholder="Onde a escola quer chegar" className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'visao', v) }} />
              </div>
              <div className="bg-slate-50 border-l-4 border-[var(--ce-primary)] rounded-r-2xl p-5">
                <p className="font-display font-bold text-[var(--ce-secondary)] text-sm mb-2">Valores</p>
                <EditableText as="p" readOnly={readOnly} multiline value={site.valores ?? ''}
                  placeholder={'Um por linha, ex:\nÉtica\nProtagonismo do aluno'}
                  className="text-sm text-slate-600 leading-relaxed whitespace-pre-line block"
                  onSave={async v => { await updateSiteFieldCE(site.id, 'valores', v) }} />
                <p className="text-[10px] text-slate-400 mt-2">Um valor por linha</p>
              </div>
            </div>
          </div>
        )}

        {pagina === 'ensino' && (
          <SegmentosSectionEditor siteId={site.id} segmentosIniciais={segmentos} readOnly={readOnly} visivel={site.secao_segmentos_visivel} />
        )}

        {pagina === 'estrutura' && (
          <DiferenciaisSectionEditor siteId={site.id} diferenciaisIniciais={diferenciais} readOnly={readOnly} visivel={site.secao_diferenciais_visivel} />
        )}

        {pagina === 'faq' && (
          <FaqSectionEditor siteId={site.id} faqIniciais={faq} readOnly={readOnly} visivel={site.secao_faq_visivel} />
        )}

        {pagina === 'contato' && (
          <div className="px-6 py-14 max-w-2xl mx-auto text-center">
            <h2 className="font-display font-extrabold text-2xl text-[var(--ce-secondary)] mb-4">Contato</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Telefone, WhatsApp, Instagram e endereço são editados na barra logo abaixo do menu — aparecem em todas as páginas do site.
            </p>
            <div className="p-5 bg-slate-50 rounded-2xl">
              <p className="text-sm text-slate-500">📋 Mensagens enviadas pelo formulário do site aparecem em</p>
              <Link href="/app/colegio-elite/leads" className="text-sm font-bold text-[var(--ce-primary)] hover:opacity-80">
                Leads recebidos →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
