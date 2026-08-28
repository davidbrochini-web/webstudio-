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
 *  módulos como "Instagram" não existem lá como item separado.
 *
 *  Esta tela (Assinatura) foi desenhada pra ser reaproveitada em
 *  todos os Projetos Especiais futuros, não só o dentista-joao — por
 *  isso esse catálogo e as descrições ficam aqui, genéricos, em vez
 *  de presos a um tenant específico. */
export const MODULOS_DISPONIVEIS_CLIENTE = [
  {
    label: 'Instagram',
    icone: '📷',
    descricao: 'Mostra automaticamente as fotos mais recentes do Instagram da clínica direto no site, sem precisar atualizar nada manualmente.',
  },
  {
    label: 'Financeiro',
    icone: '💰',
    descricao: 'Controle de contas a pagar e a receber, fluxo de caixa e relatórios financeiros simples da clínica.',
  },
  {
    label: 'CRM — Gestão de Leads',
    icone: '👥',
    descricao: 'Organiza todos os contatos que chegam (site, WhatsApp, indicação) num só lugar, com histórico de atendimento e status de cada um.',
  },
  {
    label: 'Controle de Estoque',
    icone: '📦',
    descricao: 'Controle de materiais e insumos — quantidade em estoque, validade e aviso quando algo está acabando.',
  },
  {
    label: 'Orçamentos e Pedidos',
    icone: '📋',
    descricao: 'Monta e envia orçamentos de tratamento pro paciente, com acompanhamento de quem já aprovou e quem ainda está decidindo.',
  },
  {
    label: 'Vídeos no Site',
    icone: '🎬',
    descricao: 'Espaço dedicado pra vídeos institucionais ou depoimentos de pacientes direto no site, sem precisar de um link externo.',
  },
  {
    label: 'WhatsApp Web no Painel',
    icone: '💬',
    descricao: 'Conversa pelo WhatsApp da clínica direto de dentro do painel, sem precisar trocar de tela ou de aparelho.',
  },
  {
    label: 'GPT Ads',
    icone: '✨',
    descricao: 'Anúncios com apoio de inteligência artificial pra ajustar automaticamente onde e pra quem o anúncio aparece, buscando o melhor resultado.',
  },
  {
    label: 'Controle de Usuário',
    icone: '🔐',
    descricao: 'Adiciona mais pessoas da sua equipe com login próprio, cada uma com um nível de acesso diferente — define o que cada uma pode ver e editar no painel.',
  },
] as const
