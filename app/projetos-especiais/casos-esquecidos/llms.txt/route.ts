import { getSiteEspecial, getAllContos, SITE_URL_BASE } from '@/lib/casos-esquecidos'

export const dynamic = 'force-dynamic'

export async function GET() {
  const site = await getSiteEspecial()
  const contos = await getAllContos(site.id)
  const ordenados = [...contos].sort((a, b) => a.numero - b.numero)

  const listaContos = ordenados
    .map(c => `- [${c.titulo}](${SITE_URL_BASE}/contos/${c.slug}): ${c.resumo}`)
    .join('\n')

  const txt = `# Casos Esquecidos

> Site brasileiro de contos de terror gratuitos, publicados semanalmente pelo autor D. Broch. Histórias de terror psicológico, lendas urbanas, sobrenatural e investigação paranormal, ambientadas no mesmo universo do livro "Alguns Casos Devem Ficar Esquecidos".

Casos Esquecidos publica um novo conto de terror toda semana, sempre gratuito para leitura. Cada conto é uma história completa e independente, mas todos compartilham o mesmo universo ficcional. O site também apresenta o livro do autor (disponível na Amazon) e aceita apoio via Pix.

## Contos publicados

${listaContos}

## Páginas principais

- [Todos os contos](${SITE_URL_BASE}/contos): arquivo completo de contos de terror para ler grátis
- [Sobre o autor](${SITE_URL_BASE}/sobre): D. Broch, autor brasileiro de terror psicológico
- [Feed RSS](${SITE_URL_BASE}/feed.xml): assinatura dos contos mais recentes

## Temas

Os contos são organizados em sete temas: lendas urbanas, terror psicológico, sobrenatural, criaturas, terror tecnológico, maldições e assombração. Cada tema tem sua própria página em ${SITE_URL_BASE}/contos/tema/[tema].

## Sobre o autor

D. Broch é autor brasileiro de terror. Publica contos gratuitos semanalmente em ${SITE_URL_BASE} e é autor do livro "Alguns Casos Devem Ficar Esquecidos".
`

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  })
}
