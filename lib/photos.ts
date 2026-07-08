// ─────────────────────────────────────────────────────────────
// Fotos de banco gratuito para demonstração dos templates.
//
// Usamos Picsum (fotos do Unsplash, licença livre para uso comercial).
// Testamos LoremFlickr antes por permitir busca por palavra-chave,
// mas o casamento com o banco do Flickr saiu ruim e instável —
// imagens quebradas, fora de tema, as vezes nem carregava.
// Picsum nao busca por tema, mas SEMPRE carrega e tem aparencia
// profissional — troca certa para demonstracao.
//
// keywords vira so a "semente" do sorteio — garante que a mesma
// posicao sempre mostra a mesma foto (nao fica trocando a cada load).
// ─────────────────────────────────────────────────────────────

export function themedPhoto(keywords: string, lock: number, w = 600, h = 750) {
  const seed = `${keywords}-${lock}`
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

export function themedBanner(keywords: string, lock: number, w = 1600, h = 900) {
  const seed = `${keywords}-${lock}`
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}
