'use client'

import { useState, useTransition } from 'react'
import { updateLeadCampos, updateLeadPdfs } from '@/app/admin/crm/actions'
import { uploadLeadPdf } from '@/lib/storage'
import LeadAssetsPanel from '@/components/admin/LeadAssetsPanel'

function CampoEditavel({
  id,
  campo,
  valorInicial,
  placeholder,
  rows = 2,
}: {
  id: string
  campo: 'notas' | 'texto_envio'
  valorInicial: string | null
  placeholder: string
  rows?: number
}) {
  const [valor, setValor] = useState(valorInicial ?? '')
  const [salvo, setSalvo] = useState(true)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleSalvar() {
    setErro(null)
    startTransition(async () => {
      try {
        await updateLeadCampos(id, { [campo]: valor })
        setSalvo(true)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao salvar.')
      }
    })
  }

  return (
    <div>
      <textarea
        value={valor}
        onChange={e => { setValor(e.target.value); setSalvo(false) }}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={handleSalvar}
          disabled={salvo || pending}
          className="text-xs font-semibold text-[var(--brand)] disabled:text-[var(--muted)] disabled:cursor-default"
        >
          {pending ? 'Salvando...' : salvo ? 'Salvo' : 'Salvar'}
        </button>
        {erro && <p className="text-xs text-red-500">{erro}</p>}
      </div>
    </div>
  )
}

function UploadPdf({
  id,
  tipo,
  urlAtual,
}: {
  id: string
  tipo: 'analise' | 'proposta'
  urlAtual: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(urlAtual)
  const [erro, setErro] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErro(null)
    setUploading(true)
    try {
      const campo = tipo === 'analise' ? 'analise_pdf_url' : 'proposta_pdf_url'
      const novaUrl = await uploadLeadPdf(id, tipo, file)
      await updateLeadPdfs(id, campo, novaUrl)
      setUrl(novaUrl)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar PDF.')
    } finally {
      setUploading(false)
    }
  }

  const label = tipo === 'analise' ? 'PDF de análise' : 'PDF de proposta'

  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--muted)] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--brand)] underline underline-offset-2">
            Ver PDF
          </a>
        )}
        <label className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)] cursor-pointer underline underline-offset-2">
          {uploading ? 'Enviando...' : url ? 'Trocar' : 'Enviar PDF'}
          <input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={handleFile} />
        </label>
      </div>
      {erro && <p className="text-[10px] text-red-500 mt-1">{erro}</p>}
    </div>
  )
}

export default function LeadPotencialCard({
  id,
  notas,
  textoEnvio,
  analisePdfUrl,
  propostaPdfUrl,
  logoUrl,
  imagensPortfolio,
}: {
  id: string
  notas: string | null
  textoEnvio: string | null
  analisePdfUrl: string | null
  propostaPdfUrl: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
}) {
  return (
    <div className="pt-3 border-t border-[var(--border)] grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[var(--muted)] mb-1">Observação</p>
          <CampoEditavel id={id} campo="notas" valorInicial={notas} placeholder="Observação sobre o lead..." />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[var(--muted)] mb-1">Texto a enviar</p>
          <CampoEditavel id={id} campo="texto_envio" valorInicial={textoEnvio} placeholder="Rascunho da mensagem/proposta..." rows={3} />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:border-l lg:border-[var(--border)] lg:pl-4">
        <UploadPdf id={id} tipo="analise" urlAtual={analisePdfUrl} />
        <UploadPdf id={id} tipo="proposta" urlAtual={propostaPdfUrl} />
        <LeadAssetsPanel id={id} logoUrl={logoUrl} imagensPortfolio={imagensPortfolio} />
      </div>
    </div>
  )
}
