export interface AssinaturaPagamento {
  id: string
  valor_centavos: number
  status: 'pago' | 'pendente' | 'atrasado'
  referencia: string | null
  vencimento: string | null
  pago_em: string | null
}

export interface AssinaturaItem {
  id: string
  slug: string
  label: string
  tipo: 'unico' | 'recorrente'
  valor_centavos: number
  valor_variavel_nota: string | null
  documentacao_titulo: string | null
  documentacao_conteudo: string | null
  guia_titulo: string | null
  guia_conteudo: string | null
  anexo_titulo: string | null
  anexo_url: string | null
  ativo: boolean
  ordem: number
  pagamentos: AssinaturaPagamento[]
}

export function formatCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDataCurta(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Catálogo de módulos exibidos como "disponível pra contratar" na tela
 *  de Assinatura do cliente — só a lista visível (sem preço ainda,
 *  decisão do David em 28/08/2026), não vem de `lib/modules.ts` porque
 *  a redação client-facing é diferente do catálogo interno e porque
 *  módulos como "Instagram" não existem lá como item separado. */
export const MODULOS_DISPONIVEIS_CLIENTE = [
  { label: 'Instagram', icone: '📷' },
  { label: 'Financeiro', icone: '💰' },
  { label: 'CRM — Gestão de Leads', icone: '👥' },
  { label: 'Controle de Estoque', icone: '📦' },
  { label: 'Orçamentos e Pedidos', icone: '📋' },
  { label: 'Vídeos no Site', icone: '🎬' },
  { label: 'WhatsApp Web no Painel', icone: '💬' },
  { label: 'GPT Ads', icone: '✨' },
] as const
