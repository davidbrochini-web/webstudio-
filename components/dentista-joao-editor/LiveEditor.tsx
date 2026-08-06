'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContatosBarDJ from './ContatosBarDJ'
import HeroSectionEditor from './HeroSectionEditor'
import BemVindoSectionEditor from './BemVindoSectionEditor'
import TratamentosSectionEditor, { type Tratamento } from './TratamentosSectionEditor'
import CursosSectionEditor, { type Curso } from './CursosSectionEditor'
import FaqSectionEditor, { type Faq } from './FaqSectionEditor'
import EquipeSectionEditor, { type Membro } from './EquipeSectionEditor'
import GaleriaSectionEditor from './GaleriaSectionEditor'
import EditableText from '@/components/site-editor/EditableText'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'

interface SiteDados {
  id: string
  business_name: string
  tagline: string | null
  hero_title: string | null
  hero_sub: string | null
  hero_imagem_url: string | null
  logo_url: string | null
  telefone: string | null
  whatsapp: string | null
  instagram_handle: string | null
  instagram_visivel: boolean
  endereco: string | null
  status: 'rascunho' | 'publicado'
  missao: string | null
  visao: string | null
  valores: string | null
  secao_tratamentos_visivel: boolean
  secao_cursos_visivel: boolean
  secao_equipe_visivel: boolean
  secao_faq_visivel: boolean
  textos_customizados: Record<string, string>
}

// Mesma ordem e nomes do menu real do site (components/dentista-joao/SiteNav.tsx)
const PAGINAS = [
  { id: 'home', label: 'Home' },
  { id: 'a-clinica', label: 'A Clínica' },
  { id: 'tratamentos', label: 'Tratamentos' },
  { id: 'cursos', label: 'Cursos e Eventos' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'faq', label: 'Dúvidas Frequentes' },
  { id: 'contato', label: 'Contato' },
] as const
type PaginaId = typeof PAGINAS[number]['id']

export default function LiveEditor({
  site, tratamentos, equipe, cursos, faq, fotos, readOnly,
}: {
  site: SiteDados
  tratamentos: Tratamento[]
  equipe: Membro[]
  cursos: Curso[]
  faq: Faq[]
  fotos: { id: string; url: string }[]
  readOnly: boolean
}) {
  const [pagina, setPagina] = useState<PaginaId>('home')

  return (
    <div className="min-h-screen bg-[var(--off)]">
      {/* Barra de topo (chrome do painel, não do site) */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
        <Link href="/app/projeto-especial" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] flex-shrink-0">← Painel</Link>
        <p className="text-xs text-[var(--muted)] text-center flex-1 hidden sm:block">
          Navegue pelas páginas do site abaixo e clique em qualquer texto ou foto pra editar
          {!readOnly && ' · as alterações aparecem no site na hora'}
        </p>
        <a
          href="/projetos-especiais/dentista-joao" target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-[#0EA5A0] px-3 py-1.5 rounded-lg border border-[#0EA5A0]/30 hover:bg-[#0EA5A0]/10 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Abrir site →
        </a>
      </div>

      {/* Navegação — espelha o menu real do site */}
      <div className="bg-white border-b border-[var(--border)] sticky top-[49px] z-20 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center px-4 gap-1">
          {PAGINAS.map(p => (
            <button
              key={p.id}
              onClick={() => setPagina(p.id)}
              className={`relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                pagina === p.id ? 'text-[#0B2B3C]' : 'text-slate-400 hover:text-[#0B2B3C]'
              }`}
            >
              {p.label}
              {pagina === p.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0EA5A0] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de contatos — global do site, não da seção da aba atual.
          Recolhida fora de Home/Contato pra não brigar visualmente com
          os controles específicos de cada seção (ex: toggle de visibilidade). */}
      <ContatosBarDJ
        siteId={site.id}
        telefone={site.telefone} whatsapp={site.whatsapp}
        instagramHandle={site.instagram_handle} instagramVisivel={site.instagram_visivel} endereco={site.endereco}
        status={site.status} readOnly={readOnly}
        defaultExpanded={pagina === 'home' || pagina === 'contato'}
      />

      {/* Canvas do site — mesma identidade visual do site real */}
      <div className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-white">

        {pagina === 'home' && (
          <>
            <HeroSectionEditor
              siteId={site.id}
              heroTitle={site.hero_title || site.business_name}
              heroSub={site.hero_sub || ''}
              heroImagemUrl={site.hero_imagem_url}
              readOnly={readOnly}
            />

            {/* Faixa de números — editável (pedido explícito do cliente:
                antes era fixa, agora abre pra customização) */}
            <div className="bg-[#0B2B3C] px-5 py-6 border-t border-white/5">
              <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-white">
                {[
                  { chave: 'home_stat1', numero: '10+', label: 'Anos de experiência' },
                  { chave: 'home_stat2', numero: '6', label: 'Especialidades' },
                  { chave: 'home_stat3', numero: '100%', label: 'Dedicação' },
                  { chave: 'home_stat4', numero: '5★', label: 'Atendimento' },
                ].map(s => (
                  <div key={s.chave}>
                    <EditableTextoCustomizado
                      siteId={site.id} readOnly={readOnly}
                      chave={`${s.chave}_numero`}
                      valor={site.textos_customizados?.[`${s.chave}_numero`] ?? s.numero}
                      className="font-display font-extrabold text-lg text-[#0EA5A0] block"
                    />
                    <EditableTextoCustomizado
                      siteId={site.id} readOnly={readOnly}
                      chave={`${s.chave}_label`}
                      valor={site.textos_customizados?.[`${s.chave}_label`] ?? s.label}
                      className="text-[10px] text-white/60 block"
                    />
                  </div>
                ))}
              </div>
            </div>

            <BemVindoSectionEditor
              siteId={site.id}
              businessName={site.business_name}
              tagline={site.tagline || ''}
              logoUrl={site.logo_url}
              foto={fotos[0] ?? null}
              readOnly={readOnly}
            />

            <div className="px-6 py-3 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">
                A home também mostra prévias de Tratamentos, Cursos e Dúvidas Frequentes — edite o conteúdo em cada aba acima (os títulos dessas seções também ficam editáveis lá)
              </p>
            </div>

            {/* CTA final — editável (pedido explícito do cliente) */}
            <section className="px-6 py-14 text-center bg-[#0B2B3C]">
              <EditableTextoCustomizado
                siteId={site.id} readOnly={readOnly}
                chave="home_cta_titulo"
                valor={site.textos_customizados?.home_cta_titulo ?? 'Vamos cuidar do seu sorriso?'}
                as="p"
                className="font-display font-extrabold text-xl text-white mb-3 block"
              />
              <span className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3 rounded-full text-sm opacity-70">
                Marcar consulta
              </span>
              <p className="text-white/30 text-[10px] mt-2">Botão fixo — não editável aqui</p>
            </section>
          </>
        )}

        {pagina === 'a-clinica' && (
          <>
            <div className="px-6 py-14 max-w-3xl mx-auto text-center">
              <p className="text-[#0EA5A0] font-bold text-xs uppercase tracking-widest mb-2">Sobre nós</p>
              <EditableText
                as="p" readOnly={readOnly} multiline
                value={site.tagline || ''}
                placeholder="Texto institucional — conte a história e a filosofia de trabalho da clínica"
                className="text-slate-600 leading-relaxed text-lg block"
                onSave={async v => { await updateSiteFieldPE(site.id, 'tagline', v) }}
              />
              <p className="text-xs text-slate-400 mt-3">Esse mesmo texto aparece na seção &ldquo;Bem-vindo&rdquo; da Home</p>
            </div>
            <div className="px-6 pb-8 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border-l-4 border-[#0EA5A0] rounded-r-2xl p-5 shadow-sm">
                <p className="font-display font-bold text-[#0B2B3C] text-sm mb-2">Missão</p>
                <EditableText
                  as="p" readOnly={readOnly} multiline
                  value={site.missao || ''}
                  placeholder="O propósito da clínica — por que ela existe"
                  className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldPE(site.id, 'missao', v) }}
                />
              </div>
              <div className="bg-white border-l-4 border-[#0EA5A0] rounded-r-2xl p-5 shadow-sm">
                <p className="font-display font-bold text-[#0B2B3C] text-sm mb-2">Visão</p>
                <EditableText
                  as="p" readOnly={readOnly} multiline
                  value={site.visao || ''}
                  placeholder="Onde a clínica quer chegar"
                  className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldPE(site.id, 'visao', v) }}
                />
              </div>
              <div className="bg-white border-l-4 border-[#0EA5A0] rounded-r-2xl p-5 shadow-sm">
                <p className="font-display font-bold text-[#0B2B3C] text-sm mb-2">Valores</p>
                <EditableText
                  as="p" readOnly={readOnly} multiline
                  value={site.valores || ''}
                  placeholder={'Um por linha, ex:\nProfissionalismo\nÉtica\nComprometimento'}
                  className="text-sm text-slate-600 leading-relaxed whitespace-pre-line block"
                  onSave={async v => { await updateSiteFieldPE(site.id, 'valores', v) }}
                />
                <p className="text-[10px] text-slate-400 mt-2">Um valor por linha</p>
              </div>
            </div>
            <GaleriaSectionEditor siteId={site.id} fotosIniciais={fotos} readOnly={readOnly} />
          </>
        )}

        {pagina === 'tratamentos' && (
          <TratamentosSectionEditor siteId={site.id} tratamentosIniciais={tratamentos} readOnly={readOnly} visivel={site.secao_tratamentos_visivel} textos={site.textos_customizados ?? {}} />
        )}

        {pagina === 'cursos' && (
          <CursosSectionEditor siteId={site.id} cursosIniciais={cursos} readOnly={readOnly} visivel={site.secao_cursos_visivel} textos={site.textos_customizados ?? {}} />
        )}

        {pagina === 'equipe' && (
          <EquipeSectionEditor siteId={site.id} equipeInicial={equipe} readOnly={readOnly} visivel={site.secao_equipe_visivel} />
        )}

        {pagina === 'faq' && (
          <FaqSectionEditor siteId={site.id} faqIniciais={faq} readOnly={readOnly} visivel={site.secao_faq_visivel} textos={site.textos_customizados ?? {}} />
        )}

        {pagina === 'contato' && (
          <div className="px-6 py-14 max-w-2xl mx-auto text-center">
            <p className="text-[#0EA5A0] font-bold text-xs uppercase tracking-widest mb-2">Fale conosco</p>
            <h2 className="font-display font-extrabold text-2xl text-[#0B2B3C] mb-4">Contato</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Telefone, WhatsApp, Instagram e endereço são editados na barra logo abaixo do menu — aparecem em todas as páginas do site (rodapé) e aqui na página de Contato.
            </p>
            <div className="p-5 bg-slate-50 rounded-2xl mb-4">
              <p className="text-sm text-slate-500">📋 O site também tem um formulário de contato — os pedidos enviados por ele aparecem em</p>
              <Link href="/app/projeto-especial/leads" className="text-sm font-bold text-[#0EA5A0] hover:opacity-80">
                Leads recebidos →
              </Link>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl">
              <p className="text-xs text-slate-400">O mapa da página de Contato usa o endereço cadastrado na barra acima — preencha com o endereço completo pra ele funcionar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
