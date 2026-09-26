// Funções puras e tipos compartilhados entre server (lib/casos-esquecidos.ts)
// e client components (ex: ContoForm) — nada aqui pode depender de
// next/headers ou de qualquer coisa server-only.

export const SITE_SLUG = 'casos-esquecidos'
export const SITE_URL_BASE = 'https://casosesquecidos.com.br'

export interface Conto {
  id: number
  site_id: string
  numero: number
  titulo: string
  slug: string
  resumo: string
  texto_html: string
  imagem_url: string | null
  tempo_leitura: string | null
  publicado: boolean
  temas: string[]
  data_publicacao: string
  created_at: string
  updated_at: string
}

export function imagemAbsoluta(imagemUrl: string | null | undefined): string | null {
  if (!imagemUrl) return null
  const semQuery = imagemUrl.split('?')[0]
  if (semQuery.startsWith('http://') || semQuery.startsWith('https://')) {
    return semQuery
  }
  return `${SITE_URL_BASE}${semQuery.startsWith('/') ? '' : '/'}${semQuery}`
}

export function slugify(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function markdownToHtml(raw: string): string {
  const content = raw.trim()
  const sections = content
    .split(/^\s*---\s*$/m)
    .map(s => s.trim())
    .filter(Boolean)

  const htmlSections = sections.map(section => {
    const paragraphs = section.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
    return paragraphs.map(p => `<p>${p}</p>`).join('\n')
  })

  return htmlSections.join('\n<div class="story-divider">\u2022 \u2022 \u2022</div>\n')
}

export function htmlToText(html: string): string {
  const withDividers = html.replace(
    /<div class="story-divider">[^<]*<\/div>/g,
    '\n---\n'
  )
  const withParagraphBreaks = withDividers
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')

  return withParagraphBreaks
    .split('\n')
    .map(l => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function estimarTempoLeitura(html: string): string {
  const texto = html.replace(/<[^>]+>/g, ' ')
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length
  const minutos = Math.max(1, Math.round(palavras / 200))
  return `Leitura ~${minutos} min`
}

// ── SEO helpers (26/09/2026) ────────────────────────────────────────
// Metadata do Next faz merge RASO: quando a página declara `openGraph`,
// o objeto do layout (siteName/locale/type) é descartado inteiro. Toda
// página pública espalha `ogBase(path)` no próprio openGraph pra não
// perder og:url/og:site_name/og:locale.
export function ogBase(path = '') {
  return {
    siteName: 'Casos Esquecidos',
    locale: 'pt_BR',
    url: `${SITE_URL_BASE}${path}`,
  }
}

// Meta description: o Google corta em ~155-160 caracteres. O resumo do
// conto é escrito pro card (costuma ter 180-230), então a <meta
// description> leva uma versão cortada em fronteira de palavra. OG e
// Twitter continuam com o texto completo (WhatsApp/Facebook mostram mais).
export function metaDescricao(texto: string, max = 155): string {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= max) return limpo
  const corte = limpo.slice(0, max - 1)
  // Prefere a pausa natural da frase (travessão, vírgula, ponto) se ela
  // cair depois de 60% do limite; senão, corta na última palavra.
  const pausa = Math.max(corte.lastIndexOf(' — '), corte.lastIndexOf(', '), corte.lastIndexOf('. '))
  const fim = pausa > max * 0.6 ? pausa : corte.lastIndexOf(' ')
  return corte.slice(0, fim > 0 ? fim : corte.length).replace(/[\s,;:—–-]+$/, '') + '…'
}

// Contos agendados são gravados dias antes de publicar, então updated_at
// fica ANTERIOR a data_publicacao — e dateModified < datePublished é
// sinal de dado inconsistente pro Google. A data de modificação pública
// é sempre a mais recente entre as duas.
export function dataModificacao(c: { updated_at?: string | null; data_publicacao?: string | null; created_at: string }): string {
  const candidatas = [c.updated_at, c.data_publicacao, c.created_at].filter(Boolean) as string[]
  return candidatas.reduce((a, b) => (new Date(b).getTime() > new Date(a).getTime() ? b : a))
}
