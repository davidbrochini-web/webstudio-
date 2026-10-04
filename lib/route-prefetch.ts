import type { NextRequest } from 'next/server'

/**
 * true quando a requisição é um PREFETCH do roteador do Next (o <Link>
 * busca a rota sozinho assim que aparece na tela, sem clique).
 *
 * Rota GET com efeito colateral (setar/apagar cookie, criar sessão) NÃO
 * pode executar nesse caso. Bug real (01–03/10/2026): o banner de
 * impersonação tinha <Link href="/admin/impersonar/sair">; o prefetch
 * chamava a rota de "sair" logo depois da página carregar e apagava o
 * cookie impersonate_tenant. O menu (layout, já renderizado) seguia
 * mostrando o cliente, mas toda página aberta depois caía no tenant
 * próprio do superadmin.
 */
export function ehPrefetch(request: NextRequest): boolean {
  const h = request.headers
  return (
    h.get('next-router-prefetch') === '1' ||
    h.get('purpose') === 'prefetch' ||
    (h.get('sec-purpose') ?? '').includes('prefetch')
  )
}
