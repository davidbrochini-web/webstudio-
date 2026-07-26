// ─────────────────────────────────────────────────────────────
// Catálogo canônico de módulos — única fonte de verdade, consumida
// por 3 lugares que antes divergiam entre si (achado em auditoria):
// landing (components/sections/Modules.tsx), admin
// (components/admin/TenantModulesManager.tsx) e o hub do cliente
// (app/app/(hub)/page.tsx). Slugs travados por CHECK no banco
// (migration 0019, subscriptions_modulo_check) — qualquer módulo
// novo entra aqui E na migration.
//
// Preço por módulo (decisão de produto, julho/2026): não é mais
// flat R$99/módulo — varia por complexidade, R$39,90 a R$99,90.
// `whatsapp` é o mais caro porque não é só CRUD: precisa de um
// serviço à parte rodando 24/7 (sessão Baileys por tenant), custo
// de infra que os outros módulos não têm.
// ─────────────────────────────────────────────────────────────

export interface ModuleConfig {
  slug: string
  label: string
  desc: string
  icon: string
  /** Preço mensal em reais. `null` = incluso no site, não é módulo à parte. */
  preco: number | null
  /** Já existe e pode ser contratado/testado hoje. */
  disponivel: boolean
  /** Rota do painel do cliente — null enquanto não construído. */
  href: string | null
}

export const modules: ModuleConfig[] = [
  {
    slug: 'site',
    label: 'Site + Instagram',
    desc: 'Site institucional com feed do Instagram sincronizado automaticamente.',
    icon: '🌐',
    preco: null,
    disponivel: true,
    href: '/app/editor',
  },
  {
    slug: 'cadastros',
    label: 'Cadastros',
    desc: 'Clientes, fornecedores, funcionários e produtos/serviços organizados num só lugar.',
    icon: '🗂️',
    preco: 39.90,
    disponivel: true,
    href: '/app/cadastros',
  },
  {
    slug: 'financeiro',
    label: 'Financeiro',
    desc: 'Contas a pagar, contas a receber e fluxo de caixa consolidado — um módulo só.',
    icon: '💰',
    preco: 59.90,
    disponivel: true,
    href: '/app/financeiro',
  },
  {
    slug: 'crm',
    label: 'CRM',
    desc: 'Cadastro de contatos, histórico e pipeline de oportunidades organizado.',
    icon: '👥',
    preco: 69.90,
    disponivel: false,
    href: null,
  },
  {
    slug: 'estoque',
    label: 'Controle de Estoque',
    desc: 'Entrada, saída e saldo de produtos em tempo real. Alertas de estoque mínimo.',
    icon: '📦',
    preco: 69.90,
    disponivel: false,
    href: null,
  },
  {
    slug: 'pedidos-internos',
    label: 'Pedidos Internos',
    desc: 'Requisições de compra, aprovações por alçada e rastreamento com fornecedores.',
    icon: '📋',
    preco: 79.90,
    disponivel: false,
    href: null,
  },
  {
    slug: 'agendamento',
    label: 'Agendamento',
    desc: 'Agenda online integrada ao site: cliente escolhe horário, você confirma e acompanha.',
    icon: '📅',
    preco: 89.90,
    disponivel: false,
    href: null,
  },
  {
    slug: 'videos',
    label: 'Vídeos no Site',
    desc: 'Área de vídeos no seu site institucional — apresentação, tour e depoimentos em vídeo.',
    icon: '🎬',
    preco: 39.90,
    disponivel: false,
    href: null,
  },
  {
    slug: 'whatsapp',
    label: 'WhatsApp no Painel',
    desc: 'Conecte o WhatsApp do seu negócio (via QR code) e converse direto pelo painel, com histórico salvo.',
    icon: '💬',
    preco: 99.90,
    disponivel: false,
    href: null,
  },
]

export function getModule(slug: string): ModuleConfig | undefined {
  return modules.find(m => m.slug === slug)
}

export function formatPreco(preco: number): string {
  return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
