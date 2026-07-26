// ─────────────────────────────────────────────────────────────
// Fotos reais curadas do Unsplash (licença livre, uso comercial
// permitido) — 2 a 3 por nicho, escolhidas manualmente. Ciclamos
// entre elas para variar o visual sem repetir a mesma foto toda hora.
//
// Sites reais de tenant (banco de dados) guardam a URL completa da
// foto do próprio cliente em vez de um ID do Unsplash — as funções
// abaixo aceitam as duas formas: se já for uma URL (http/https),
// devolve direto; se for só o ID, monta a URL do Unsplash.
// ─────────────────────────────────────────────────────────────

export function unsplashPhoto(photoIdOrUrl: string, w = 800, h = 600) {
  if (/^https?:\/\//.test(photoIdOrUrl)) return photoIdOrUrl
  return `https://images.unsplash.com/photo-${photoIdOrUrl}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}

/** Pega a foto na posição `index`, ciclando pelo array se o índice passar do tamanho. */
export function unsplashPhotoFrom(photoIds: string[], index: number, w = 800, h = 600) {
  if (photoIds.length === 0) {
    // site novo, ainda sem foto cadastrada — placeholder cinza neutro
    return `https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=${w}&h=${h}&fit=crop&auto=format&q=80`
  }
  const id = photoIds[index % photoIds.length]
  return unsplashPhoto(id, w, h)
}
