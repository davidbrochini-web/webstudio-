import { headers } from 'next/headers'
import { GET as casosEsquecidosLlmsTxt } from '@/app/projetos-especiais/casos-esquecidos/llms.txt/route'

// Mesma mecânica do feed.xml (ver app/feed.xml/route.ts) — path com "."
// não passa pelo rewrite do proxy.ts, cai direto na raiz da plataforma.
const DOMAIN_LLMS_TXT: Record<string, () => Promise<Response>> = {
  'casosesquecidos.com.br': casosEsquecidosLlmsTxt,
  'www.casosesquecidos.com.br': casosEsquecidosLlmsTxt,
}

export async function GET() {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const handler = DOMAIN_LLMS_TXT[host]
  if (handler) return handler()

  return new Response('Not found', { status: 404 })
}
