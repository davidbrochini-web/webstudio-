'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import { updateSiteFieldPE } from '@/app/app/(hub)/projeto-especial/editor/actions'

export default function ContatosBarDJ({ siteId, telefone, whatsapp, instagramHandle, endereco, status, readOnly }: {
  siteId: string
  telefone: string | null
  whatsapp: string | null
  instagramHandle: string | null
  endereco: string | null
  status: 'rascunho' | 'publicado'
  readOnly: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)
  const [statusAtual, setStatusAtual] = useState(status)

  async function salvar(field: 'telefone' | 'whatsapp' | 'instagram_handle' | 'endereco', v: string) {
    setErro(null)
    try { await updateSiteFieldPE(siteId, field, v) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
  }

  return (
    <div className="bg-[#0B2B3C] px-5 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/40">📞</span>
          <EditableText as="span" readOnly={readOnly} value={telefone ?? ''} placeholder="Telefone"
            className="text-white font-medium" onSave={v => salvar('telefone', v)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">💬</span>
          <EditableText as="span" readOnly={readOnly} value={whatsapp ?? ''} placeholder="WhatsApp (só números, ex: 5511999999999)"
            className="text-white font-medium" onSave={v => salvar('whatsapp', v)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">📷</span>
          <EditableText as="span" readOnly={readOnly} value={instagramHandle ?? ''} placeholder="@usuario"
            className="text-white font-medium" onSave={v => salvar('instagram_handle', v)} />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-white/40">📍</span>
          <EditableText as="span" readOnly={readOnly} value={endereco ?? ''} placeholder="Endereço completo"
            className="text-white font-medium" onSave={v => salvar('endereco', v)} />
        </div>

        {/* Status de publicação */}
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
                try { await updateSiteFieldPE(siteId, 'status', v) } catch (err) { setErro(err instanceof Error ? err.message : 'Erro ao salvar.') }
              }}
              className="text-xs font-bold bg-white/10 text-white rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-[#0EA5A0] cursor-pointer"
            >
              <option value="rascunho" className="text-[#0B2B3C]">Rascunho</option>
              <option value="publicado" className="text-[#0B2B3C]">Publicado</option>
            </select>
          )}
        </div>
      </div>
      {erro && <p className="text-xs text-red-300 mt-1 max-w-4xl mx-auto">{erro}</p>}
    </div>
  )
}
