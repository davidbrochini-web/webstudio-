'use client'

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'

interface Props {
  file: File
  aspect: number // largura / altura do resultado final
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

const FRAME_W = 300 // px na tela (o corte final sai em resolução maior, ver OUT_W)
const OUT_W = 1000

export default function ImageCropModal({ file, aspect, onConfirm, onCancel }: Props) {
  const frameH = FRAME_W / aspect
  const imgUrl = useMemo(() => URL.createObjectURL(file), [file])
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [gerando, setGerando] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    return () => URL.revokeObjectURL(imgUrl)
  }, [imgUrl])

  const baseScale = natural.w > 0 ? Math.max(FRAME_W / natural.w, frameH / natural.h) : 1
  const dispW = natural.w * baseScale * zoom
  const dispH = natural.h * baseScale * zoom

  const clamp = useCallback((x: number, y: number, dw: number, dh: number) => ({
    x: Math.min(0, Math.max(FRAME_W - dw, x)),
    y: Math.min(0, Math.max(frameH - dh, y)),
  }), [frameH])

  function onImgLoad() {
    if (!imgRef.current) return
    const w = imgRef.current.naturalWidth
    const h = imgRef.current.naturalHeight
    const bs = Math.max(FRAME_W / w, frameH / h)
    setNatural({ w, h })
    setZoom(1)
    setPos(clamp((FRAME_W - w * bs) / 2, (frameH - h * bs) / 2, w * bs, h * bs))
  }

  function ajustarZoom(novo: number) {
    setZoom(novo)
    const nbs = Math.max(FRAME_W / natural.w, frameH / natural.h)
    const ndw = natural.w * nbs * novo
    const ndh = natural.h * nbs * novo
    // mantém o centro do enquadramento ao trocar o zoom
    setPos(p => {
      const cx = p.x - (ndw - dispW) / 2
      const cy = p.y - (ndh - dispH) / 2
      return clamp(cx, cy, ndw, ndh)
    })
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPos(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy, dispW, dispH))
  }
  function onPointerUp() { dragRef.current = null }

  function confirmar() {
    if (!imgRef.current || natural.w === 0) return
    setGerando(true)
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = Math.round(OUT_W / aspect)
    const ctx = canvas.getContext('2d')
    if (!ctx) { setGerando(false); return }
    const scale = OUT_W / FRAME_W
    ctx.drawImage(imgRef.current, pos.x * scale, pos.y * scale, dispW * scale, dispH * scale)
    canvas.toBlob(blob => {
      setGerando(false)
      if (blob) onConfirm(blob)
    }, 'image/png')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <p className="font-display font-bold text-[#0B2B3C] mb-1">Ajustar foto</p>
        <p className="text-xs text-slate-500 mb-4">Arraste a foto pra posicionar e use o controle pra dar zoom.</p>

        <div
          className="relative mx-auto overflow-hidden rounded-xl bg-slate-100 touch-none select-none cursor-move"
          style={{ width: FRAME_W, height: frameH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imgUrl && (
            <img
              ref={imgRef}
              src={imgUrl}
              onLoad={onImgLoad}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: dispW || undefined,
                height: dispH || undefined,
                maxWidth: 'none',
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs text-slate-400">🔍</span>
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => ajustarZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[#0EA5A0]"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button type="button" onClick={confirmar} disabled={gerando || natural.w === 0}
            className="flex-1 text-sm font-bold text-white bg-[#0EA5A0] rounded-full py-2.5 disabled:opacity-50">
            {gerando ? 'Preparando…' : 'Usar esta foto'}
          </button>
          <button type="button" onClick={onCancel} disabled={gerando}
            className="flex-1 text-sm font-bold text-[#0B2B3C] bg-slate-100 rounded-full py-2.5 disabled:opacity-50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
