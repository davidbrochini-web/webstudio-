import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'

export async function GET(request: NextRequest) {
  const info = await getCurrentTenant()
  if (!info) return new Response('Não autorizado', { status: 401 })

  const itemId = request.nextUrl.searchParams.get('item')
  const campo = request.nextUrl.searchParams.get('campo')
  if (!itemId || (campo !== 'documentacao' && campo !== 'guia')) {
    return new Response('Parâmetros inválidos', { status: 400 })
  }

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('assinatura_itens')
    .select('tenant_id, documentacao_titulo, documentacao_conteudo, guia_titulo, guia_conteudo')
    .eq('id', itemId)
    .single()

  // RLS já filtra por is_member_of_tenant/is_super_admin, mas confere
  // de novo aqui pra garantir 404 (não 500) se vier vazio por
  // permissão, e pra nunca depender só da política do banco numa
  // rota que devolve o conteúdo direto pro navegador.
  if (!item || item.tenant_id !== info.tenantId) {
    return new Response('Documento não encontrado', { status: 404 })
  }

  const titulo = campo === 'documentacao' ? item.documentacao_titulo : item.guia_titulo
  const conteudo = campo === 'documentacao' ? item.documentacao_conteudo : item.guia_conteudo
  if (!titulo || !conteudo) return new Response('Documento não encontrado', { status: 404 })

  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { default: DocumentoClientePdf } = await import('@/components/pdf/DocumentoClientePdf')

  const buffer = await renderToBuffer(
    DocumentoClientePdf({ titulo, conteudo, tenantNome: info.tenantNome })
  )

  const nomeArquivo = titulo
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    .toLowerCase()

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nomeArquivo}.pdf"`,
    },
  })
}
