'use client'

import { useState, useTransition, useEffect } from 'react'
import { updateLeadCampos, updateLeadPdfs, updateLeadLogo, addLeadImagemPortfolio, removeLeadImagemPortfolio, gerarPropostaPdf, criarDemoParaLead } from '@/app/admin/crm/actions'
import { niches } from '@/lib/templates'
import { uploadLeadPdf, uploadLeadImagem } from '@/lib/storage'

function CampoEditavelCompacto({
  id,
  campo,
  valorInicial,
  placeholder,
  rows = 2,
  onEnviarParaSimulador,
}: {
  id: string
  campo: 'notas' | 'texto_envio'
  valorInicial: string | null
  placeholder: string
  rows?: number
  onEnviarParaSimulador?: (texto: string) => Promise<void>
}) {
  const [valor, setValor] = useState(valorInicial ?? '')
  const [salvo, setSalvo] = useState(true)
  const [pending, startTransition] = useTransition()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function handleSalvar() {
    startTransition(async () => {
      await updateLeadCampos(id, { [campo]: valor })
      setSalvo(true)
    })
  }

  function handleEnviarParaSimulador() {
    if (!onEnviarParaSimulador || !valor.trim()) return
    setEnviando(true)
    setEnviado(false)
    onEnviarParaSimulador(valor)
      .then(() => {
        setEnviado(true)
        setTimeout(() => setEnviado(false), 3000)
      })
      .finally(() => setEnviando(false))
  }

  // Só o campo "texto_envio" ganha o botão de enviar — "notas" é
  // anotação interna, nunca vai pro cliente. O envio manda o texto
  // direto pra conversa do simulador (mesma engine de análise que o
  // resto do WhatsApp simulado usa) — nunca abre nada fora do CRM.
  // Quando a ZAP-API existir de verdade, esse mesmo botão passa a
  // mandar pro WhatsApp real em vez do simulado.
  const podeEnviar = campo === 'texto_envio' && !!onEnviarParaSimulador

  return (
    <div>
      <textarea
        value={valor}
        onChange={e => { setValor(e.target.value); setSalvo(false) }}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--off)] text-xs outline-none resize-none focus:border-[var(--brand)]"
      />
      <div className="flex items-center gap-3 mt-1">
        {!salvo && (
          <button onClick={handleSalvar} disabled={pending} className="text-[10px] font-semibold text-[var(--brand)]">
            {pending ? 'Salvando...' : 'Salvar'}
          </button>
        )}
        {podeEnviar && (
          <button
            onClick={handleEnviarParaSimulador}
            disabled={enviando || !valor.trim()}
            className="text-[10px] font-bold text-white bg-[#25D366] px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : enviado ? 'Enviado ✓' : 'Enviar para o cliente'}
          </button>
        )}
      </div>
    </div>
  )
}

function BotaoPdf({ id, tipo, urlAtual }: { id: string; tipo: 'analise' | 'proposta'; urlAtual: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(urlAtual)

  // urlAtual pode mudar depois do primeiro render (ex: "Gerar
  // proposta" cria um PDF novo) — sem isso, o botão ficava mostrando
  // "enviar" pra sempre até recarregar a página, mesmo com o PDF já
  // salvo de verdade no banco.
  useEffect(() => {
    setUrl(urlAtual)
  }, [urlAtual])

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
    <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)]">
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
    <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)]">
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
        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--muted)]"
      >
        🖼️ Fotos ({lista.length})
      </button>
      {aberto && (
        <div className="absolute z-10 top-full left-0 mt-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 shadow-lg w-56">
          <div className="flex flex-wrap gap-1.5">
            {lista.map((url, i) => (
              <div key={url} className="relative w-10 h-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[8px] text-[var(--muted)] flex items-center justify-center hover:text-red-500"
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

function BotaoCriarDemo({
  id,
  nichos,
  linkInicial,
  nichoInicial,
}: {
  id: string
  nichos: { slug: string; label: string }[]
  linkInicial: string | null
  nichoInicial: string | null
}) {
  const [nicho, setNicho] = useState(nichos[0]?.slug ?? '')
  const [criando, setCriando] = useState(false)
  const [link, setLink] = useState<string | null>(linkInicial)
  const [nichoAtivo, setNichoAtivo] = useState<string | null>(nichoInicial)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function handleCriar() {
    setCriando(true)
    setErro(null)
    try {
      const res = await criarDemoParaLead(id, nicho)
      if (res.error) {
        setErro(res.error)
      } else {
        setLink(res.link ?? null)
        setNichoAtivo(res.nicho ?? null)
      }
    } finally {
      setCriando(false)
    }
  }

  function handleCopiar() {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (link) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">
          Demo ativa {nichoAtivo ? `— ${nichoAtivo}` : ''}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)]">
          <span className="text-[var(--muted)] truncate max-w-[180px]">{link}</span>
          <button onClick={handleCopiar} className="font-semibold text-[var(--brand)] underline underline-offset-2 flex-shrink-0">
            {copiado ? 'copiado ✓' : 'copiar'}
          </button>
        </div>
        <p className="text-[10px] text-[var(--muted)]">Manda esse link pro lead pelo WhatsApp durante a negociação.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={nicho}
        onChange={e => setNicho(e.target.value)}
        className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--ink)] outline-none"
      >
        {nichos.map(n => <option key={n.slug} value={n.slug}>{n.label}</option>)}
      </select>
      <button
        onClick={handleCriar}
        disabled={criando || !nicho}
        className="text-[11px] font-bold text-white bg-[var(--brand)] px-2.5 py-1 rounded-full disabled:opacity-60"
      >
        {criando ? 'Criando...' : '✨ Criar demo'}
      </button>
      {erro && <span className="text-[10px] text-red-600">{erro}</span>}
    </div>
  )
}

function BotaoGerarProposta({ id, onGerado }: { id: string; onGerado: (url: string) => void }) {
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [urlGerada, setUrlGerada] = useState<string | null>(null)

  async function handleGerar() {
    setGerando(true)
    setErro(null)
    setUrlGerada(null)
    try {
      const res = await gerarPropostaPdf(id)
      if (res.error) {
        setErro(res.error)
      } else if (res.url) {
        onGerado(res.url)
        setUrlGerada(res.url)
      }
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
      {erro && <span className="text-[10px] text-red-600">{erro}</span>}
      {urlGerada && (
        <a
          href={urlGerada}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-[var(--brand)] underline underline-offset-2"
        >
          Gerada ✓ — abrir/baixar PDF
        </a>
      )}
    </div>
  )
}

export default function LeadMateriaisCompacto({
  id,
  onEnviarParaSimulador,
  notas,
  textoEnvio,
  analisePdfUrl,
  propostaPdfUrl,
  logoUrl,
  imagensPortfolio,
  demoLinkInicial,
  demoNichoInicial,
}: {
  id: string
  onEnviarParaSimulador: (texto: string) => Promise<void>
  notas: string | null
  textoEnvio: string | null
  analisePdfUrl: string | null
  propostaPdfUrl: string | null
  logoUrl: string | null
  imagensPortfolio: string[]
  demoLinkInicial: string | null
  demoNichoInicial: string | null
}) {
  const [propostaUrl, setPropostaUrl] = useState(propostaPdfUrl)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Observação</p>
        <p className="text-[10px] text-[var(--muted)] mb-1.5">Anotação interna sua — o lead nunca vê isso.</p>
        <CampoEditavelCompacto id={id} campo="notas" valorInicial={notas} placeholder="Anote algo sobre o lead..." />
      </div>

      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Texto a enviar</p>
        <p className="text-[10px] text-[var(--muted)] mb-1.5">Rascunho da mensagem — o botão manda pra conversa ao lado (simulada, por enquanto).</p>
        <CampoEditavelCompacto id={id} campo="texto_envio" valorInicial={textoEnvio} placeholder="Rascunho da mensagem/proposta..." rows={3} onEnviarParaSimulador={onEnviarParaSimulador} />
      </div>

      <div className="border border-[var(--border)] rounded-xl p-3">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">① Proposta em PDF</p>
        <p className="text-[10px] text-[var(--muted)] mb-2">
          Sobe a logo e algumas fotos do negócio do lead aqui embaixo — o botão &quot;Gerar proposta&quot; usa
          exatamente esses dois pra montar o PDF sozinho, junto com o que já está cadastrado do lead
          (nome, segmento, avaliação no Google). Não precisa escrever nada na mão.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <BotaoLogo id={id} urlAtual={logoUrl} />
          <BotaoPortfolio id={id} imagens={imagensPortfolio} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <BotaoGerarProposta id={id} onGerado={setPropostaUrl} />
          <span className="text-[10px] text-[var(--muted)]">↓ resultado fica salvo aqui:</span>
          <BotaoPdf id={id} tipo="proposta" urlAtual={propostaUrl} />
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-xl p-3">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">② Documento de análise (avulso)</p>
        <p className="text-[10px] text-[var(--muted)] mb-2">
          PDF separado, sem relação com a proposta acima — pra guardar uma análise específica desse
          lead (ex: simulação de investimento em anúncios). Sempre subido manualmente.
        </p>
        <BotaoPdf id={id} tipo="analise" urlAtual={analisePdfUrl} />
      </div>

      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">Demo pro lead</p>
        <p className="text-[10px] text-[var(--muted)] mb-1.5">Escolhe o modelo mais parecido com o negócio dele — o site já nasce pronto, cheio, só falta personalizar.</p>
        <BotaoCriarDemo id={id} nichos={niches} linkInicial={demoLinkInicial} nichoInicial={demoNichoInicial} />
      </div>
    </div>
  )
}
