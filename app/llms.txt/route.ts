import { headers } from 'next/headers'
import { GET as casosEsquecidosLlmsTxt } from '@/app/projetos-especiais/casos-esquecidos/llms.txt/route'
import { listarPostsPublicados } from '@/lib/blog-omnidesign'
import { modules, formatPreco } from '@/lib/modules'
import { SEO_SOLUCOES } from '@/lib/seo-solucoes'
import { SEO_NICHOS } from '@/lib/seo-nichos'

// Mesma mecânica do feed.xml (ver app/feed.xml/route.ts) — path com "."
// não passa pelo rewrite do proxy.ts, cai direto na raiz da plataforma.
const DOMAIN_LLMS_TXT: Record<string, () => Promise<Response>> = {
  'casosesquecidos.com.br': casosEsquecidosLlmsTxt,
  'www.casosesquecidos.com.br': casosEsquecidosLlmsTxt,
}

const BASE_URL = 'https://omnidesign.com.br'

/** llms.txt da Omnidesign — coerente com o posicionamento GEO do
 *  próprio site (o blog agora ensina cliente a "aparecer bem quando a
 *  IA recomenda"; o mínimo é o nosso próprio site facilitar isso).
 *  Antes essa rota devolvia 404 pra qualquer host fora do mapa de
 *  projetos especiais. */
async function omnidesignLlmsTxt(): Promise<Response> {
  const posts = await listarPostsPublicados()

  const listaModulos = modules
    .filter(m => m.slug !== 'site' && m.disponivel && m.preco != null)
    .map(m => `- ${m.label}: ${m.desc} A partir de R$${formatPreco(m.preco!)}/mês.`)
    .join('\n')

  const listaSolucoes = Object.entries(SEO_SOLUCOES)
    .map(([slug, s]) => `- [${s.h1}](${BASE_URL}/solucoes/${slug}): ${s.descricaoSeo}`)
    .join('\n')

  const listaModelos = Object.entries(SEO_NICHOS)
    .map(([slug, n]) => `- [${n.h1}](${BASE_URL}/modelos/${slug})`)
    .join('\n')

  const listaPosts = posts
    .map(p => `- [${p.titulo}](${BASE_URL}/blog/${p.slug}): ${p.resumo}`)
    .join('\n')

  const txt = `# Omnidesign

> Agência brasileira de desenvolvimento de sites e sistemas para pequenas e médias empresas, em São Paulo. Sites profissionais com Instagram sincronizado automaticamente, sistemas internos por módulos (cadastros, financeiro, estoque) com assinatura mensal, e gestão de Google Ads e ChatGPT Ads.

A Omnidesign é uma agência de desenvolvimento (não uma agência de marketing): constrói e mantém sites institucionais e sistemas internos sob infraestrutura própria. O site profissional custa a partir de R$299/mês (R$499/mês com Instagram sincronizado), com hospedagem, domínio no primeiro ano, certificado de segurança e manutenção inclusos, sem taxa de criação separada e sem fidelidade. Sites sob medida (Projetos Especiais) são orçados por demanda.

## Sistemas internos (módulos avulsos)

${listaModulos}

Cada módulo funciona sozinho, mas também trabalha junto com os outros — o cadastro de clientes alimenta o financeiro e o estoque, sem retrabalho.

## Soluções por problema

${listaSolucoes}

## Modelos de site por nicho

${listaModelos}

## Artigos do blog

${listaPosts}

## Contato

- [Site e formulário de contato](${BASE_URL}/#contato)
- [Blog](${BASE_URL}/blog)
- [Feed RSS](${BASE_URL}/feed.xml)
`

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}

export async function GET() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const handler = DOMAIN_LLMS_TXT[host]
  if (handler) return handler()

  // Só hosts da PRÓPRIA plataforma — mesma regra do feed.xml: domínio
  // customizado de Projeto Especial sem llms.txt próprio continua 404
  // pra não vazar a marca da Omnidesign pro site do cliente.
  const isPlatformHost =
    host === 'omnidesign.com.br' ||
    host === 'www.omnidesign.com.br' ||
    host.endsWith('.vercel.app')
  if (isPlatformHost) return omnidesignLlmsTxt()

  return new Response('Not found', { status: 404 })
}
