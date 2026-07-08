// ─────────────────────────────────────────────────────────────
// Fotos reais curadas do Unsplash (licença livre, uso comercial
// permitido) — 2 a 3 por nicho, escolhidas manualmente. Ciclamos
// entre elas para variar o visual sem repetir a mesma foto toda hora.
//
// Para produção real, cada cliente troca isso pela foto do
// próprio negócio.
// ─────────────────────────────────────────────────────────────

export function unsplashPhoto(photoId: string, w = 800, h = 600) {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

/** Pega a foto na posição `index`, ciclando pelo array se o índice passar do tamanho. */
export function unsplashPhotoFrom(photoIds: string[], index: number, w = 800, h = 600) {
  const id = photoIds[index % photoIds.length]
  return unsplashPhoto(id, w, h)
}
