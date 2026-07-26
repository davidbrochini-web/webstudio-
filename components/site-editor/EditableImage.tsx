'use client'

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react'
import { uploadSiteFoto } from '@/lib/storage'

interface Props {
  src: string
  siteId: string
  onReplace: (newUrl: string) => Promise<void>
  readOnly?: boolean
  className?: string
  alt?: string
  badge?: string
}

export default function EditableImage({ src, siteId, onReplace, readOnly, className = '', alt = '', badge }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadSiteFoto(siteId, file)
      await onReplace(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={`relative group ${className}`}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      {badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {!readOnly && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-colors cursor-pointer">
          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full transition-opacity">
            {uploading ? 'Enviando...' : '✏️ Trocar foto'}
          </span>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {error && (
        <p className="absolute -bottom-6 left-0 right-0 text-[11px] text-red-600 bg-white/90 px-1 rounded">{error}</p>
      )}
    </div>
  )
}
