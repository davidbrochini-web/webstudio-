'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContatosBarDJ from './ContatosBarDJ'
import MenuLabelsEditor from './MenuLabelsEditor'
import HeroSectionEditor from './HeroSectionEditor'
import BemVindoSectionEditor from './BemVindoSectionEditor'
import TratamentosSectionEditor, { type Tratamento } from './TratamentosSectionEditor'
import CursosSectionEditor, { type Curso } from './CursosSectionEditor'
import NovidadesSectionEditor from './NovidadesSectionEditor'
import FaqSectionEditor, { type Faq } from './FaqSectionEditor'
import EquipeSectionEditor, { type Membro } from './EquipeSectionEditor'
import DepoimentosSectionEditor, { type Depoimento } from './DepoimentosSectionEditor'
import GaleriaSectionEditor from './GaleriaSectionEditor'
import EditableText from '@/components/site-editor/EditableText'
import EditableTextoCustomizado from '@/components/site-editor/EditableTextoCustomizado'
import { texto } from '@/lib/textos-customizados'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'

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
  secao_tratamentos_visivel: boolean
  secao_cursos_visivel: boolean
  secao_equipe_visivel: boolean
  secao_faq_visivel: boolean
  secao_depoimentos_visivel: boolean
  textos_customizados: Record<string, string>
  cor_primaria: string
  cor_secundaria: string
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
  site, tratamentos, equipe, depoimentos, cursos, faq, fotos, readOnly,
}: {
  site: SiteDados
  tratamentos: Tratamento[]
  equipe: Membro[]
  depoimentos: Depoimento[]
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
          className="text-xs font-semibold text-[var(--dj-primary)] px-3 py-1.5 rounded-lg border border-[var(--dj-primary)]/30 hover:bg-[var(--dj-primary)]/10 transition-colors whitespace-nowrap flex-shrink-0"
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
                pagina === p.id ? 'text-[var(--dj-secondary)]' : 'text-slate-400 hover:text-[var(--dj-secondary)]'
              }`}
            >
              {p.label}
              {pagina === p.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--dj-primary)] rounded-full" />
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

      {/* Nomes do menu — chrome global (aparece em toda página), cliente
          pediu pra poder trocar o texto sem mexer na URL/rota. */}
      <MenuLabelsEditor
        siteId={site.id}
        textos={site.textos_customizados}
        readOnly={readOnly}
        defaultExpanded={pagina === 'home'}
      />

      {/* Canvas do site — mesma identidade visual do site real, incluindo
          a paleta customizada (aba Cores), pra edição e site real nunca
          divergirem visualmente */}
      <div
        className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-white"
        style={{
          '--dj-primary': site.cor_primaria || '#0EA5A0',
          '--dj-secondary': site.cor_secundaria || '#0B2B3C',
        } as React.CSSProperties}
      >

        {pagina === 'home' && (
          <>
            <HeroSectionEditor
              siteId={site.id}
              heroTitle={site.hero_title || site.business_name}
              heroSub={site.hero_sub || ''}
              heroImagemUrl={site.hero_imagem_url}
              readOnly={readOnly}
              textos={site.textos_customizados}
            />

            {/* Aviso: os outros 2 slides do carrossel da Home vêm dos 2
                primeiros tratamentos cadastrados — não são editáveis aqui */}
            <div className="bg-amber-50 border-y border-amber-200 px-5 sm:px-6 py-3 text-xs text-amber-800 flex items-center gap-2 flex-wrap">
              <span>💡</span>
              <span>Esse banner é só o 1º de 3 no site real. Os outros 2 vêm automaticamente dos 2 primeiros tratamentos cadastrados — pra mudar a foto/texto deles, edite na</span>
              <button type="button" onClick={() => setPagina('tratamentos')} className="font-bold underline hover:opacity-70">aba Tratamentos</button>
            </div>

            {/* Faixa de números — editável (pedido explícito do cliente:
                antes era fixa, agora abre pra customização) */}
            <div className="bg-[var(--dj-secondary)] px-5 py-6 border-t border-white/5">
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
                      className="font-display font-extrabold text-lg text-[var(--dj-primary)] block"
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
              logoPosicao={site.logo_posicao}
              foto={fotos[0] ?? null}
              readOnly={readOnly}
            />

            <NovidadesSectionEditor siteId={site.id} readOnly={readOnly} textos={site.textos_customizados ?? {}} />

            <DepoimentosSectionEditor siteId={site.id} depoimentosInicial={depoimentos} readOnly={readOnly} visivel={site.secao_depoimentos_visivel} />

            <div className="px-6 py-3 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">
                A home também mostra prévias de Tratamentos, Cursos e Dúvidas Frequentes — edite o conteúdo em cada aba acima (os títulos dessas seções também ficam editáveis lá). Novidades Clínicas (acima) é a única prévia editada direto aqui, porque não tem aba própria — o conteúdo dela vem da aba Blog do menu principal.
              </p>
            </div>

            {/* CTA final — editável (pedido explícito do cliente) */}
            <section className="px-6 py-14 text-center bg-[var(--dj-secondary)]">
              <EditableTextoCustomizado
                siteId={site.id} readOnly={readOnly}
                chave="home_cta_titulo"
                valor={site.textos_customizados?.home_cta_titulo ?? 'Vamos cuidar do seu sorriso?'}
                as="p"
                className="font-display font-extrabold text-xl text-white mb-3 block"
              />
              <span className="inline-block bg-[var(--dj-primary)] text-white font-bold px-6 py-3 rounded-full text-sm opacity-70">
                Marcar consulta
              </span>
              <p className="text-white/30 text-[10px] mt-2">Botão fixo — não editável aqui</p>
            </section>
          </>
        )}

        {pagina === 'a-clinica' && (
          <>
            <div className="px-6 py-14 max-w-3xl mx-auto text-center">
              <EditableTextoCustomizado
                siteId={site.id} chave="aclinica_eyebrow"
                valor={texto(site.textos_customizados, 'aclinica_eyebrow', 'Sobre nós.')}
                readOnly={readOnly} as="p"
                className="text-[var(--dj-primary)] font-bold text-xs uppercase tracking-widest mb-2 block"
              />
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
              <div className="bg-white border-l-4 border-[var(--dj-primary)] rounded-r-2xl p-5 shadow-sm">
                <EditableTextoCustomizado
                  siteId={site.id} chave="aclinica_missao_titulo"
                  valor={texto(site.textos_customizados, 'aclinica_missao_titulo', 'Missão')}
                  readOnly={readOnly} as="p"
                  className="font-display font-bold text-[var(--dj-secondary)] text-sm mb-2 block"
                />
                <EditableText
                  as="p" readOnly={readOnly} multiline
                  value={site.missao || ''}
                  placeholder="O propósito da clínica — por que ela existe"
                  className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldPE(site.id, 'missao', v) }}
                />
              </div>
              <div className="bg-white border-l-4 border-[var(--dj-primary)] rounded-r-2xl p-5 shadow-sm">
                <EditableTextoCustomizado
                  siteId={site.id} chave="aclinica_visao_titulo"
                  valor={texto(site.textos_customizados, 'aclinica_visao_titulo', 'Visão')}
                  readOnly={readOnly} as="p"
                  className="font-display font-bold text-[var(--dj-secondary)] text-sm mb-2 block"
                />
                <EditableText
                  as="p" readOnly={readOnly} multiline
                  value={site.visao || ''}
                  placeholder="Onde a clínica quer chegar"
                  className="text-sm text-slate-600 leading-relaxed italic block"
                  onSave={async v => { await updateSiteFieldPE(site.id, 'visao', v) }}
                />
              </div>
              <div className="bg-white border-l-4 border-[var(--dj-primary)] rounded-r-2xl p-5 shadow-sm">
                <EditableTextoCustomizado
                  siteId={site.id} chave="aclinica_valores_titulo"
                  valor={texto(site.textos_customizados, 'aclinica_valores_titulo', 'Valores')}
                  readOnly={readOnly} as="p"
                  className="font-display font-bold text-[var(--dj-secondary)] text-sm mb-2 block"
                />
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
            <p className="text-[var(--dj-primary)] font-bold text-xs uppercase tracking-widest mb-2">Fale conosco</p>
            <h2 className="font-display font-extrabold text-2xl text-[var(--dj-secondary)] mb-4">Contato</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Telefone, WhatsApp, Instagram e endereço são editados na barra logo abaixo do menu — aparecem em todas as páginas do site (rodapé) e aqui na página de Contato.
            </p>
            <div className="p-5 bg-slate-50 rounded-2xl mb-4 text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Textos desta página</p>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Título (com agenda configurada)</p>
                  <EditableTextoCustomizado siteId={site.id} chave="contato_agenda_titulo"
                    valor={texto(site.textos_customizados, 'contato_agenda_titulo', 'Agende sua consulta')}
                    readOnly={readOnly} as="span" className="text-slate-700 font-medium" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Subtítulo (com agenda configurada)</p>
                  <EditableTextoCustomizado siteId={site.id} chave="contato_agenda_subtitulo"
                    valor={texto(site.textos_customizados, 'contato_agenda_subtitulo', 'Escolha o dia e horário disponível. Após o envio, a clínica confirmará seu agendamento.')}
                    readOnly={readOnly} as="span" multiline className="text-slate-700" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Título do formulário (quando já tem agenda)</p>
                  <EditableTextoCustomizado siteId={site.id} chave="contato_form_titulo_com_agenda"
                    valor={texto(site.textos_customizados, 'contato_form_titulo_com_agenda', 'Ou envie uma mensagem')}
                    readOnly={readOnly} as="span" className="text-slate-700 font-medium" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Título do formulário (sem agenda ainda)</p>
                  <EditableTextoCustomizado siteId={site.id} chave="contato_form_titulo_sem_agenda"
                    valor={texto(site.textos_customizados, 'contato_form_titulo_sem_agenda', 'Marque sua consulta!')}
                    readOnly={readOnly} as="span" className="text-slate-700 font-medium" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 mb-0.5">Frase ao lado dos contatos</p>
                  <EditableTextoCustomizado siteId={site.id} chave="contato_lateral_titulo"
                    valor={texto(site.textos_customizados, 'contato_lateral_titulo', 'Entre em contato com a equipe e tire todas as suas dúvidas!')}
                    readOnly={readOnly} as="span" multiline className="text-slate-700" />
                </div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl mb-4">
              <p className="text-sm text-slate-500">📋 O site também tem um formulário de contato — os pedidos enviados por ele aparecem em</p>
              <Link href="/app/projeto-especial/leads" className="text-sm font-bold text-[var(--dj-primary)] hover:opacity-80">
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
