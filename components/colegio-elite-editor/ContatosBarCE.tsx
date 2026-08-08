'use client'

import { useState, useTransition } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import { updateSiteFieldCE, updateInstagramVisivel } from '@/app/app/(hub)/colegio-elite/actions'
import { IconPhone, IconWhatsApp, IconInstagram } from '@/components/colegio-elite/icons'

export default function ContatosBarCE({ siteId, telefone, whatsapp, instagramHandle, instagramVisivel, endereco, status, readOnly, defaultExpanded }: {
  siteId: string
  telefone: string | null
  whatsapp: string | null
  instagramHandle: string | null
  instagramVisivel: boolean
  endereco: string | null
  status: 'rascunho' | 'publicado'
  readOnly: boolean
  defaultExpanded?: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [statusAtual, setStatusAtual] = useState(status)
  const [igVisivel, setIgVisivel] = useState(instagramVisivel)
  const [igPending, startIgTransition] = useTransition()
  const [expandido, setExpandido] = useState(defaultExpanded ?? true)

  async function salvar(field: 'telefone' | 'whatsapp' | 'instagram_handle' | 'endereco', v: string) {
    setErro(null)
    try { await updateSiteFieldCE(siteId, field, v) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  function alternarInstagram() {
    const novo = !igVisivel
    const anterior = igVisivel
    setErro(null)
    setIgVisivel(novo)
    startIgTransition(async () => {
      try { await updateInstagramVisivel(siteId, novo) }
      catch (e) { setIgVisivel(anterior); setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
    })
  }

  if (!expandido) {
    return (
      <div className="bg-[var(--ce-secondary)] px-5 sm:px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button type="button" onClick={() => setExpandido(true)}
            className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1.5">
            <span>▸</span> Contato e status do site
          </button>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusAtual === 'publicado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {statusAtual === 'publicado' ? 'Publicado' : 'Rascunho'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--ce-secondary)] px-5 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <IconPhone className="w-3.5 h-3.5 text-white/40" />
          <EditableText as="span" readOnly={readOnly} value={telefone ?? ''} placeholder="Telefone"
            className="text-white font-medium" onSave={v => salvar('telefone', v)} />
        </div>
        <div className="flex items-center gap-2">
          <IconWhatsApp className="w-3.5 h-3.5 text-white/40" />
          <EditableText as="span" readOnly={readOnly} value={whatsapp ?? ''} placeholder="WhatsApp (só números, ex: 5511999999999)"
            className="text-white font-medium" onSave={v => salvar('whatsapp', v)} />
        </div>
        <div className="flex items-center gap-2">
          <IconInstagram className="w-3.5 h-3.5 text-white/40" />
          <EditableText as="span" readOnly={readOnly} value={instagramHandle ?? ''} placeholder="@usuario"
            className="text-white font-medium" onSave={v => salvar('instagram_handle', v)} />
          {!readOnly && (
            <button type="button" disabled={igPending} onClick={alternarInstagram}
              title={igVisivel ? 'Ícone visível — clique pra ocultar' : 'Ícone oculto — clique pra mostrar'}
              className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${
                igVisivel ? 'bg-[var(--ce-primary)]/20 text-[var(--ce-primary)]' : 'bg-white/10 text-white/40'
              }`}>
              {igVisivel ? 'visível' : 'oculto'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-white/40">📍</span>
          <EditableText as="span" readOnly={readOnly} value={endereco ?? ''} placeholder="Endereço completo"
            className="text-white font-medium" onSave={v => salvar('endereco', v)} />
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="text-white/40 text-xs">Site:</span>
          {readOnly ? (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusAtual === 'publicado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {statusAtual === 'publicado' ? 'Publicado' : 'Rascunho'}
            </span>
          ) : (
            <select
              value={statusAtual}
              onChange={async e => {
                const v = e.target.value as 'rascunho' | 'publicado'
                setStatusAtual(v)
                try { await updateSiteFieldCE(siteId, 'status', v) } catch (err) { setErro(err instanceof Error ? err.message : 'Erro ao salvar.') }
              }}
              className="text-xs font-bold bg-white/10 text-white rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-[var(--ce-primary)] cursor-pointer"
            >
              <option value="rascunho" className="text-[var(--ce-secondary)]">Rascunho</option>
              <option value="publicado" className="text-[var(--ce-secondary)]">Publicado</option>
            </select>
          )}
          {defaultExpanded === false && (
            <button type="button" onClick={() => setExpandido(false)}
              className="text-white/30 hover:text-white/60 text-xs ml-1" title="Recolher">▾</button>
          )}
        </div>
      </div>
      {erro && <p className="text-xs text-red-300 mt-1 max-w-4xl mx-auto">{erro}</p>}
    </div>
  )
}
