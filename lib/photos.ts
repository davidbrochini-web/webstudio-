// ─────────────────────────────────────────────────────────────
// Fotos temáticas de banco gratuito (LoremFlickr → Flickr CC).
// keywords: tema da foto (ex: 'barbershop,haircut')
// lock: inteiro que trava a mesma foto para a mesma posição
// Apenas para demonstração — cliente real fornece fotos próprias.
// ─────────────────────────────────────────────────────────────

export function themedPhoto(keywords: string, lock: number, w = 600, h = 750) {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${lock}`
}

export function themedBanner(keywords: string, lock: number, w = 1600, h = 900) {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${lock}`
}
