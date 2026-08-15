'use client'

import { useState, useTransition } from 'react'
import { updateLeadCampos, updateLeadPdfs, updateLeadLogo, addLeadImagemPortfolio, removeLeadImagemPortfolio, gerarPropostaPdf } from '@/app/admin/crm/actions'
import { uploadLeadPdf, uploadLeadImagem } from '@/lib/storage'

function CampoEditavelCompacto({
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

  function handleSalvar() {
    startTransition(async () => {
      await updateLeadCampos(id, { [campo]: valor })
      setSalvo(true)
    })
  }

  return (
    <div>
      <textarea
        value={valor}
        onChange={e => { setValor(e.target.value); setSalvo(false) }}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-xs outline-none resize-none focus:border-[var(--brand)]"
      />
      {!salvo && (
        <button onClick={handleSalvar} disabled={pending} className="text-[10px] font-semibold text-[var(--brand)] mt-1">
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      )}
    </div>
  )
}

function BotaoPdf({ id, tipo, urlAtual }: { id: string; tipo: 'analise' | 'proposta'; urlAtual: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(urlAtual)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const campo = tipo === 'analise' ? 'analise_pdf_url' : 'proposta_pdf_url'
      const novaUrl = await uploadLeadPdf(id, tipo, file)
      await updateLeadPdfs(id, campo, novaUrl)
      setUrl(novaUrl)
    } finally {
      setUploading(false)
    }
  }

  const label = tipo === 'analise' ? 'Análise' : 'Proposta'

  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-white">
      <span className={url ? 'text-[var(--brand)]' : 'text-[var(--muted)]'}>📄 {label}</span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] underline underline-offset-2">ver</a>
      )}
      <label className="text-[var(--muted)] hover:text-[var(--brand)] cursor-pointer underline underline-offset-2">
        {uploading ? '...' : url ? 'trocar' : 'enviar'}
        <input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={handleFile} />
      </label>
    </div>
  )
}

function BotaoLogo({ id, urlAtual }: { id: string; urlAtual: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(urlAtual)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const novaUrl = await uploadLeadImagem(id, 'logo', file)
      await updateLeadLogo(id, novaUrl)
      setUrl(novaUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-white">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-4 h-4 rounded object-contain" />
      ) : (
        <span>🏷️</span>
      )}
      <span className="text-[var(--muted)]">Logo</span>
      <label className="text-[var(--muted)] hover:text-[var(--brand)] cursor-pointer underline underline-offset-2">
        {uploading ? '...' : url ? 'trocar' : 'enviar'}
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
      </label>
    </div>
  )
}

function BotaoPortfolio({ id, imagens }: { id: string; imagens: string[] }) {
  const [lista, setLista] = useState(imagens)
  const [uploading, setUploading] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [, startTransition] = useTransition()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadLeadImagem(id, 'portfolio', file)
      await addLeadImagemPortfolio(id, url)
      setLista(l => [...l, url])
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleRemove(index: number) {
    startTransition(async () => {
      await removeLeadImagemPortfolio(id, index)
      setLista(l => l.filter((_, i) => i !== index))
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(a => !a)}
        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-white text-[var(--muted)]"
      >
        🖼️ Fotos ({lista.length})
      </button>
      {aberto && (
        <div className="absolute z-10 top-full left-0 mt-1 bg-white border border-[var(--border)] rounded-xl p-2.5 shadow-lg w-56">
          <div className="flex flex-wrap gap-1.5">
            {lista.map((url, i) => (
              <div key={url} className="relative w-10 h-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-[var(--border)] text-[8px] text-[var(--muted)] flex items-center justify-center hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="w-10 h-10 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center text-xs text-[var(--muted)] cursor-pointer hover:border-[var(--brand)] hover:text-[var(--brand)]">
              {uploading ? '···' : '+'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleFile} />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

function BotaoGerarProposta({ id }: { id: string }) {
  const [gerando, setGerando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleGerar() {
    setGerando(true)
    setMsg(null)
    try {
      const res = await gerarPropostaPdf(id)
      setMsg(res.error ? res.error : 'Gerada ✓')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleGerar}
        disabled={gerando}
        className="text-[11px] font-bold text-white bg-[var(--brand)] px-2.5 py-1 rounded-full disabled:opacity-60"
      >
        {gerando ? 'Gerando...' : '✨ Gerar proposta'}
      </button>
      {msg && <span className="text-[10px] text-[var(--muted)]">{msg}</span>}
    </div>
  )
}

export default function LeadMateriaisCompacto({
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
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <CampoEditavelCompacto id={id} campo="notas" valorInicial={notas} placeholder="Observação..." />
        <CampoEditavelCompacto id={id} campo="texto_envio" valorInicial={textoEnvio} placeholder="Texto a enviar..." />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <BotaoPdf id={id} tipo="analise" urlAtual={analisePdfUrl} />
        <BotaoPdf id={id} tipo="proposta" urlAtual={propostaPdfUrl} />
        <BotaoLogo id={id} urlAtual={logoUrl} />
        <BotaoPortfolio id={id} imagens={imagensPortfolio} />
        <BotaoGerarProposta id={id} />
      </div>
    </div>
  )
}
