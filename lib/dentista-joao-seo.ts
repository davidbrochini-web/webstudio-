import type { Metadata } from 'next'
import { SITE_URL_BASE, type SiteEspecial } from '@/lib/dentista-joao'

/**
 * OpenGraph + Twitter completos por página.
 *
 * Por que existe: o Next faz merge RASO de metadata por chave — se a
 * página não redeclara `openGraph`, herda o do layout inteiro, inclusive
 * `og:url` = home. Resultado real encontrado em 26/09: todas as páginas
 * institucionais diziam pro Facebook/WhatsApp que eram a home, e as de
 * tratamento/artigo (que redeclaravam só `images`) perdiam og:url,
 * og:type, og:title e siteName. Toda página pública usa este helper.
 */
export function ogPagina(
  site: Pick<SiteEspecial, 'business_name' | 'hero_imagem_url'>,
  opts: {
    path: string            // '' pra home, '/tratamentos', etc.
    titulo: string          // título completo, já com o nome do site
    descricao?: string | null
    imagem?: string | null  // cai na foto do hero se vazio
    tipo?: 'website' | 'article'
  },
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const url = `${SITE_URL_BASE}${opts.path}`
  const imagem = opts.imagem || site.hero_imagem_url || undefined
  const descricao = opts.descricao || undefined
  return {
    openGraph: {
      type: opts.tipo ?? 'website',
      locale: 'pt_BR',
      siteName: site.business_name,
      url,
      title: opts.titulo,
      ...(descricao ? { description: descricao } : {}),
      ...(imagem ? { images: [imagem] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.titulo,
      ...(descricao ? { description: descricao } : {}),
      ...(imagem ? { images: [imagem] } : {}),
    },
  }
}

/**
 * Títulos de tratamento vêm do banco em CAIXA ALTA ("IMPLANTE DENTÁRIO",
 * "SISOS "). Na tela é estilo do cliente e fica; no <title>/og:title
 * (resultado do Google) caixa alta parece spam e perde clique. Converte
 * só quando o texto está INTEIRO em maiúsculas — título já escrito
 * normal passa intacto. Siglas curtas (ATM) ficam como estão.
 */
export function tituloLegivel(texto: string): string {
  const t = texto.trim().replace(/\s+/g, ' ')
  if (t !== t.toUpperCase() || t.length <= 4) return t
  const minusculas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'para', 'a', 'o'])
  return t
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && minusculas.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}
