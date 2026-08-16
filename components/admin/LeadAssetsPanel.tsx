'use client'

import { useState, useTransition } from 'react'
import {
  updateLeadLogo,
  addLeadImagemPortfolio,
  removeLeadImagemPortfolio,
  gerarPropostaPdf,
} from '@/app/admin/crm/actions'
import { uploadLeadImagem } from '@/lib/storage'

function LogoUpload({ id, urlAtual }: { id: string; urlAtual: string | null }) {
  const [url, setUrl] = useState(urlAtual)
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErro(null)
    setUploading(true)
    try {
      const novaUrl = await uploadLeadImagem(id, 'logo', file)
      await updateLeadLogo(id, novaUrl)
      setUrl(novaUrl)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar logo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--muted)] mb-1.5">Logo</p>
      <div className="flex items-center gap-2.5">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-11 h-11 rounded-lg object-contain bg-[var(--off)] border border-[var(--border)]" />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-[var(--off)] border border-dashed border-[var(--border)] flex items-center justify-center text-sm">🏷️</div>
        )}
        <label className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)] cursor-pointer underline underline-offset-2">
          {uploading ? 'Enviando...' : url ? 'Trocar' : 'Enviar logo'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
        </label>
      </div>
      {erro && <p className="text-[10px] text-red-500 mt-1">{erro}</p>}
    </div>
  )
}

function PortfolioUpload({ id, imagens }: { id: string; imagens: string[] }) {
  const [lista, setLista] = useState(imagens)
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendingRemove, startTransition] = useTransition()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErro(null)
    setUploading(true)
    try {
      const url = await uploadLeadImagem(id, 'portfolio', file)
      await addLeadImagemPortfolio(id, url)
      setLista(l => [...l, url])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleRemove(index: number) {
    startTransition(async () => {
      try {
        await removeLeadImagemPortfolio(id, index)
        setLista(l => l.filter((_, i) => i !== index))
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao remover foto.')
      }
    })
  }

  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--muted)] mb-1.5">Fotos do portfólio (até 6 usadas no mockup)</p>
      <div className="flex flex-wrap gap-2">
        {lista.map((url, i) => (
          <div key={url} className="relative w-12 h-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover border border-[var(--border)]" />
            <button
              onClick={() => handleRemove(i)}
              disabled={pendingRemove}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[9px] text-[var(--muted)] flex items-center justify-center hover:text-red-500 hover:border-red-200"
            >
              ×
            </button>
          </div>
        ))}
        <label className="w-12 h-12 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)] cursor-pointer hover:border-[var(--brand)] hover:text-[var(--brand)]">
          {uploading ? '···' : '+'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
        </label>
      </div>
      {erro && <p className="text-[10px] text-red-500 mt-1">{erro}</p>}
    </div>
  )
}

export default function LeadAssetsPanel({
  id,
  logoUrl,
  imagensPortfolio,
}: {
  id: string
  logoUrl: string | null
  imagensPortfolio: string[]
}) {
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  async function handleGerar() {
    setErro(null)
    setSucesso(null)
    setGerando(true)
    try {
      const res = await gerarPropostaPdf(id)
      if (res.error) setErro(res.error)
      else setSucesso('Proposta gerada — atualiza a página pra ver o link em "PDF de proposta".')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar proposta.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-dashed border-[var(--border)]">
      <p className="text-[11px] font-semibold text-[var(--muted)]">
        Material pra proposta <span className="font-normal">(opcional — melhora o PDF gerado)</span>
      </p>
      <LogoUpload id={id} urlAtual={logoUrl} />
      <PortfolioUpload id={id} imagens={imagensPortfolio} />

      <button
        onClick={handleGerar}
        disabled={gerando}
        className="self-start text-xs font-bold text-white bg-[var(--brand)] px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {gerando ? 'Gerando proposta...' : '✨ Gerar Proposta (PDF)'}
      </button>
      {sucesso && <p className="text-xs text-[var(--brand)]">{sucesso}</p>}
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}
