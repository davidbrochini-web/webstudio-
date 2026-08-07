'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import EditableImage from '@/components/site-editor/EditableImage'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'
import { replaceFoto, addFotoToPool } from '@/app/app/editor/actions'

export default function BemVindoSectionEditor({ siteId, businessName, tagline, logoUrl, logoPosicao, foto, readOnly }: {
  siteId: string
  businessName: string
  tagline: string
  logoUrl: string | null
  logoPosicao: 'esquerda' | 'centro'
  foto: { id: string; url: string } | null
  readOnly: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [fotoAtual, setFotoAtual] = useState(foto)
  const [posicao, setPosicao] = useState(logoPosicao)
  const [salvandoPosicao, setSalvandoPosicao] = useState(false)

  async function trocarPosicao(nova: 'esquerda' | 'centro') {
    if (nova === posicao) return
    const anterior = posicao
    setPosicao(nova)
    setSalvandoPosicao(true)
    setErro(null)
    try { await updateSiteFieldPE(siteId, 'logo_posicao', nova) }
    catch (e) { setPosicao(anterior); setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    finally { setSalvandoPosicao(false) }
  }

  return (
    <section className="px-6 py-14 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <EditableImage
        src={fotoAtual?.url || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=60'}
        siteId={siteId}
        readOnly={readOnly}
        className="w-full aspect-[4/3] rounded-2xl border-4 border-[var(--dj-primary)]/20 shadow-lg overflow-hidden"
        alt=""
        badge="Foto de destaque"
        aspect={4 / 3}
        onReplace={async (url) => {
          setErro(null)
          try {
            if (fotoAtual) { await replaceFoto(fotoAtual.id, url); setFotoAtual({ ...fotoAtual, url }) }
            else { const created = await addFotoToPool(siteId, url); if (created) setFotoAtual(created) }
          } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
        }}
      />
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-400 mb-1">Bem-vindo à</h2>
        <EditableText
          as="p" readOnly={readOnly}
          value={businessName}
          placeholder="Nome da clínica"
          className="font-display font-extrabold text-3xl text-[var(--dj-secondary)] mb-4 block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'business_name', v) }}
        />
        <EditableText
          as="p" readOnly={readOnly} multiline
          value={tagline}
          placeholder="Texto institucional — conte a filosofia de trabalho da clínica"
          className="text-slate-500 leading-relaxed mb-2 block"
          onSave={async v => { await updateSiteFieldPE(siteId, 'tagline', v) }}
        />
        <p className="text-xs text-slate-400 mb-5">Esse texto também aparece na página &ldquo;A Clínica&rdquo;</p>

        {!readOnly && (
          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Logo do menu</p>
            <p className="text-xs text-slate-400 mb-3">
              Por padrão o menu do site mostra o nome da clínica escrito. Suba um PNG aqui pra usar sua logo no lugar (formato quadrado — a barra do menu já está preparada pra esse formato, sem cortar a imagem).
            </p>
            <EditableImage
              src={logoUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=60'}
              siteId={siteId}
              readOnly={readOnly}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50"
              alt="Logo"
              aspect={1}
              badge={logoUrl ? undefined : 'Sem logo — mostrando nome'}
              onReplace={async (url) => {
                setErro(null)
                try { await updateSiteFieldPE(siteId, 'logo_url', url) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
              }}
              onRemove={logoUrl ? async () => {
                setErro(null)
                try { await updateSiteFieldPE(siteId, 'logo_url', '') } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao remover.') }
              } : undefined}
            />

            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-5 mb-2">Posição do logo no menu</p>
            <div className="flex gap-2">
              <button type="button" disabled={salvandoPosicao} onClick={() => trocarPosicao('esquerda')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border-2 transition-colors disabled:opacity-50 ${
                  posicao === 'esquerda'
                    ? 'border-[var(--dj-primary)] bg-[var(--dj-primary)]/10 text-[var(--dj-secondary)]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                📍 Canto esquerdo
              </button>
              <button type="button" disabled={salvandoPosicao} onClick={() => trocarPosicao('centro')}
                className={`text-xs font-semibold px-3.5 py-2 rounded-xl border-2 transition-colors disabled:opacity-50 ${
                  posicao === 'centro'
                    ? 'border-[var(--dj-primary)] bg-[var(--dj-primary)]/10 text-[var(--dj-secondary)]'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>
                🎯 Centralizado
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">No centro, os itens do menu se dividem nos dois lados do logo. Muda na hora — dá pra ver no site real.</p>
          </div>
        )}

        {erro && <p className="text-xs text-red-600 mt-2">{erro}</p>}
      </div>
    </section>
  )
}
