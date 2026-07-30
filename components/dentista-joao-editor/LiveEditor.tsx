'use client'

import Link from 'next/link'
import Image from 'next/image'
import ContatosBarDJ from './ContatosBarDJ'
import HeroSectionEditor from './HeroSectionEditor'
import BemVindoSectionEditor from './BemVindoSectionEditor'
import TratamentosSectionEditor from './TratamentosSectionEditor'
import CursosSectionEditor from './CursosSectionEditor'
import FaqSectionEditor from './FaqSectionEditor'
import EquipeSectionEditor from './EquipeSectionEditor'
import GaleriaSectionEditor from './GaleriaSectionEditor'

interface SiteDados {
  id: string
  business_name: string
  tagline: string | null
  hero_title: string | null
  hero_sub: string | null
  hero_imagem_url: string | null
  telefone: string | null
  whatsapp: string | null
  instagram_handle: string | null
  endereco: string | null
  status: 'rascunho' | 'publicado'
}

export default function LiveEditor({
  site, tratamentos, equipe, cursos, faq, fotos, readOnly,
}: {
  site: SiteDados
  tratamentos: any[]
  equipe: any[]
  cursos: any[]
  faq: any[]
  fotos: { id: string; url: string }[]
  readOnly: boolean
}) {
  return (
    <div className="min-h-screen bg-[var(--off)]">
      {/* Barra de topo (chrome do painel, não do site) */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/app/projeto-especial" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">← Painel</Link>
        </div>
        <p className="text-xs text-[var(--muted)] text-center flex-1">
          Clique em qualquer texto ou foto do site abaixo pra editar direto aqui
          {!readOnly && ' · as alterações aparecem no site na hora'}
        </p>
        <a
          href="/projetos-especiais/dentista-joao" target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-[#0EA5A0] px-3 py-1.5 rounded-lg border border-[#0EA5A0]/30 hover:bg-[#0EA5A0]/10 transition-colors whitespace-nowrap flex-shrink-0"
        >
          Abrir site →
        </a>
      </div>

      {/* Canvas do site — mesma identidade visual do site real */}
      <div className="max-w-6xl mx-auto my-6 rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-white">

        <ContatosBarDJ
          siteId={site.id}
          telefone={site.telefone} whatsapp={site.whatsapp}
          instagramHandle={site.instagram_handle} endereco={site.endereco}
          status={site.status} readOnly={readOnly}
        />

        <HeroSectionEditor
          siteId={site.id}
          heroTitle={site.hero_title || site.business_name}
          heroSub={site.hero_sub || ''}
          heroImagemUrl={site.hero_imagem_url}
          readOnly={readOnly}
        />

        {/* Faixa de números — fixa, não editável (combinar com a Omnidesign pra mudar) */}
        <div className="bg-[#0B2B3C] px-5 py-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4 text-center text-white/50">
            {['10+ Anos de experiência', '6 Especialidades', '100% Dedicação', '5★ Atendimento'].map(s => (
              <p key={s} className="text-[10px]">{s}</p>
            ))}
          </div>
        </div>

        <BemVindoSectionEditor
          siteId={site.id}
          businessName={site.business_name}
          tagline={site.tagline || ''}
          foto={fotos[0] ?? null}
          readOnly={readOnly}
        />

        <TratamentosSectionEditor siteId={site.id} tratamentosIniciais={tratamentos} readOnly={readOnly} />

        <CursosSectionEditor siteId={site.id} cursosIniciais={cursos} readOnly={readOnly} />

        <FaqSectionEditor siteId={site.id} faqIniciais={faq} readOnly={readOnly} />

        <EquipeSectionEditor siteId={site.id} equipeInicial={equipe} readOnly={readOnly} />

        <GaleriaSectionEditor siteId={site.id} fotosIniciais={fotos} readOnly={readOnly} />

        {/* CTA final — fixo */}
        <section className="px-6 py-14 text-center bg-[#0B2B3C]">
          <p className="font-display font-extrabold text-xl text-white mb-3">Vamos cuidar do seu sorriso?</p>
          <span className="inline-block bg-[#0EA5A0] text-white font-bold px-6 py-3 rounded-full text-sm opacity-70">
            Marcar consulta
          </span>
          <p className="text-white/30 text-[10px] mt-2">Seção fixa — não editável aqui</p>
        </section>
      </div>
    </div>
  )
}
