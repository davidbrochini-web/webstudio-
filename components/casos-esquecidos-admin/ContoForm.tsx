'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageCropModal from '@/components/site-editor/ImageCropModal'
import { uploadContoImagem } from '@/lib/storage'
import { getAllTemas } from '@/lib/temas-casos-esquecidos'
import { htmlToText } from '@/lib/casos-esquecidos-shared'
import type { Conto } from '@/lib/casos-esquecidos-shared'
import type { ContoResultado } from '@/app/app/(hub)/casos-esquecidos/actions'

const ASPECT = 1600 / 700 // banner do conto — mesma proporção usada no site público

interface Props {
  siteId: string
  conto?: Conto // presente = modo edição
  action: (siteId: string, formData: FormData) => Promise<ContoResultado>
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ContoForm({ siteId, conto, action }: Props) {
  const router = useRouter()
  const isEdit = !!conto

  const [titulo, setTitulo] = useState(conto?.titulo ?? '')
  const [resumo, setResumo] = useState(conto?.resumo ?? '')
  const [corpo, setCorpo] = useState(conto ? htmlToText(conto.texto_html) : '')
  const [temasSelecionados, setTemasSelecionados] = useState<string[]>(conto?.temas ?? [])
  const [dataPublicacao, setDataPublicacao] = useState(conto ? toDatetimeLocal(conto.data_publicacao) : '')
  const [publicado, setPublicado] = useState(conto?.publicado ?? true)
  const [imagemUrl, setImagemUrl] = useState<string | null>(conto?.imagem_url ?? null)
  const [arquivoParaCortar, setArquivoParaCortar] = useState<File | null>(null)
  const [enviandoImagem, setEnviandoImagem] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErro('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
      return
    }
    setErro(null)
    setArquivoParaCortar(file)
    e.target.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    setArquivoParaCortar(null)
    setEnviandoImagem(true)
    setErro(null)
    try {
      const croppedFile = new File([blob], 'banner.png', { type: 'image/png' })
      const url = await uploadContoImagem(siteId, croppedFile)
      setImagemUrl(url)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar imagem.')
    } finally {
      setEnviandoImagem(false)
    }
  }

  function toggleTema(slug: string) {
    setTemasSelecionados(prev =>
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!titulo.trim() || !resumo.trim() || !corpo.trim()) {
      setErro('Preencha título, resumo e corpo do conto.')
      return
    }

    setSalvando(true)
    const formData = new FormData()
    formData.set('titulo', titulo)
    formData.set('resumo', resumo)
    formData.set('corpo', corpo)
    formData.set('imagem_url', imagemUrl ?? '')
    formData.set('temas', temasSelecionados.join(','))
    formData.set('data_publicacao', dataPublicacao)
    if (isEdit) {
      formData.set('publicado', publicado ? 'on' : '')
      formData.set('slug', conto!.slug)
    }

    const resultado = await action(siteId, formData)
    setSalvando(false)

    if (!resultado.ok) {
      setErro(resultado.error)
      return
    }
    router.push('/app/casos-esquecidos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {erro && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{erro}</div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">Título</label>
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm"
          placeholder="Ex: O Portal de Pedra Negra"
        />
        {isEdit && <p className="text-xs text-[var(--muted)] mt-1">Slug não muda depois de criado: <code>{conto!.slug}</code></p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">Resumo (aparece no card e nos metadados)</label>
        <textarea
          value={resumo}
          onChange={e => setResumo(e.target.value)}
          rows={3}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">
          Corpo do conto — separe seções com uma linha só com <code>---</code>
        </label>
        <textarea
          value={corpo}
          onChange={e => setCorpo(e.target.value)}
          rows={16}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm font-mono"
          placeholder={'Parágrafo 1.\n\nParágrafo 2.\n\n---\n\nNova seção.'}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">Imagem do banner (1600×700)</label>
        {imagemUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagemUrl} alt="" className="w-full aspect-[1600/700] object-cover rounded-lg mb-2 border border-[var(--border)]" />
        )}
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)] border border-[var(--border)] rounded-lg px-3 py-2 cursor-pointer hover:bg-black/5 transition-colors w-fit">
          {enviandoImagem ? 'Enviando…' : imagemUrl ? 'Trocar imagem' : 'Enviar imagem'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={enviandoImagem} />
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">Temas (1-2 recomendado)</label>
        <div className="flex flex-wrap gap-2">
          {getAllTemas().map(t => (
            <button
              key={t.slug}
              type="button"
              onClick={() => toggleTema(t.slug)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                temasSelecionados.includes(t.slug)
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--ink)]/40'
              }`}
            >
              {t.nomeCurto}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">
          Data de publicação {!isEdit && '(vazio = agora)'}
        </label>
        <input
          type="datetime-local"
          value={dataPublicacao}
          onChange={e => setDataPublicacao(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm"
        />
        <p className="text-xs text-[var(--muted)] mt-1">Uma data futura mantém o caso selado até a hora chegar.</p>
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <input type="checkbox" checked={publicado} onChange={e => setPublicado(e.target.checked)} />
          Visível no site (desmarcar oculta sem apagar)
        </label>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando || enviandoImagem}
          className="bg-[var(--ink)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {salvando ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Publicar caso'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/app/casos-esquecidos')}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-[var(--border)] hover:bg-black/5 transition-colors"
        >
          Cancelar
        </button>
      </div>

      {arquivoParaCortar && (
        <ImageCropModal
          file={arquivoParaCortar}
          aspect={ASPECT}
          onConfirm={handleCropConfirm}
          onCancel={() => setArquivoParaCortar(null)}
        />
      )}
    </form>
  )
}
