'use client'

import { useState } from 'react'
import EditableText from '@/components/site-editor/EditableText'
import { updateSiteField } from '@/app/app/editor/actions'

export default function ContactSettingsBar({ siteId, whatsapp, instagramHandle, readOnly }: {
  siteId: string
  whatsapp: string | null
  instagramHandle: string | null
  readOnly: boolean
}) {
  const [erro, setErro] = useState<string | null>(null)

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl px-5 py-3 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">📱 WhatsApp:</span>
          <EditableText
            as="span" readOnly={readOnly}
            value={whatsapp ?? ''}
            placeholder="5511999999999"
            className="font-semibold text-[var(--ink)]"
            onSave={async v => {
              setErro(null)
              try { await updateSiteField(siteId, 'whatsapp', v) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted)]">📷 Instagram:</span>
          <EditableText
            as="span" readOnly={readOnly}
            value={instagramHandle ?? ''}
            placeholder="@seunegocio"
            className="font-semibold text-[var(--ink)]"
            onSave={async v => {
              setErro(null)
              try { await updateSiteField(siteId, 'instagram_handle', v) } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao salvar.') }
            }}
          />
        </div>
      </div>
      {erro && <p className="text-xs text-red-600 mt-1">{erro}</p>}
    </div>
  )
}
