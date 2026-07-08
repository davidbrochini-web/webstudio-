// ─────────────────────────────────────────────────────────────
// Fotos reais curadas do Unsplash (licença livre, uso comercial
// permitido) — uma por nicho, escolhida manualmente para bater
// com o segmento. Não é busca automática: são IDs fixos.
//
// Para produção real, cada cliente troca isso pela foto do
// próprio negócio.
// ─────────────────────────────────────────────────────────────

export function unsplashPhoto(photoId: string, w = 800, h = 600) {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`
}
