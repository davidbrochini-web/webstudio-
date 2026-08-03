'use client'

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react'
import { uploadSiteFoto } from '@/lib/storage'
import ImageCropModal from './ImageCropModal'

interface Props {
  src: string
  siteId: string
  onReplace: (newUrl: string) => Promise<void>
  onRemove?: () => Promise<void>
  readOnly?: boolean
  className?: string
  alt?: string
  badge?: string
  /** Proporção largura/altura do resultado final (ex: 4/3, 1 pra
   *  quadrado, 16/9 pra banner). Usada pelo mini-editor de corte que
   *  abre antes do upload. Padrão 4/3 se não informado. */
  aspect?: number
}

// Barra de ações sempre visível (não depende de :hover — no touch/mobile
// não existe hover, então o controle ficava invisível e ninguém achava
// como trocar/remover a imagem). Ocupa uma faixa fixa embaixo da imagem.
export default function EditableImage({ src, siteId, onReplace, onRemove, readOnly, className = '', alt = '', badge, aspect = 4 / 3 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [arquivoParaCortar, setArquivoParaCortar] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Envie um arquivo de imagem (JPG, PNG, WEBP...).')
      return
    }
    setError(null)
    // Abre o mini-editor de corte antes de subir — pedido do cliente pra
    // poder posicionar/enquadrar a foto na proporção certa do site em
    // vez de subir a imagem inteira sem controle nenhum.
    setArquivoParaCortar(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    setArquivoParaCortar(null)
    setUploading(true)
    setError(null)
    try {
      const croppedFile = new File([blob], 'foto.png', { type: 'image/png' })
      const url = await uploadSiteFoto(siteId, croppedFile)
      await onReplace(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!onRemove) return
    setRemoving(true)
    setError(null)
    try {
      await onRemove()
      setConfirmando(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      {badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {!readOnly && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-2 py-2 bg-gradient-to-t from-black/75 via-black/40 to-transparent">
          {confirmando ? (
            <>
              <span className="text-[11px] text-white font-semibold">Remover foto?</span>
              <button type="button" onClick={handleRemove} disabled={removing}
                className="text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-full px-2.5 py-1 disabled:opacity-50">
                {removing ? '...' : 'Sim'}
              </button>
              <button type="button" onClick={() => setConfirmando(false)} disabled={removing}
                className="text-[11px] font-bold text-white bg-white/25 hover:bg-white/35 rounded-full px-2.5 py-1">
                Não
              </button>
            </>
          ) : (
            <>
              <label className="text-[11px] font-semibold text-white bg-white/25 hover:bg-white/35 rounded-full px-3 py-1.5 cursor-pointer transition-colors">
                {uploading ? 'Enviando…' : '✏️ Trocar'}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
              {onRemove && (
                <button type="button" onClick={() => setConfirmando(true)}
                  className="text-[11px] font-semibold text-white bg-white/25 hover:bg-red-500/80 rounded-full px-3 py-1.5 transition-colors">
                  🗑️ Remover
                </button>
              )}
            </>
          )}
        </div>
      )}
      {error && (
        <p className="absolute -bottom-6 left-0 right-0 text-[11px] text-red-600 bg-white/90 px-1 rounded z-20">{error}</p>
      )}
      {arquivoParaCortar && (
        <ImageCropModal
          file={arquivoParaCortar}
          aspect={aspect}
          onConfirm={handleCropConfirm}
          onCancel={() => setArquivoParaCortar(null)}
        />
      )}
    </div>
  )
}
