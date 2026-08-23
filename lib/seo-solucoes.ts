/**
 * Conteúdo de SEO das páginas /solucoes/[problema] — cada página mira
 * a busca de um problema específico ("controle de estoque sem
 * planilha") e conecta com o módulo interno que resolve, puxando
 * preço e submenu direto de lib/modules.ts (fonte única).
 *
 * Regras seguidas aqui (mesmas do lib/seo-nichos.ts):
 * - Uma página por PROBLEMA, não por lista de módulos — cada uma
 *   mira uma dor específica, com título/FAQ próprios (nada de
 *   conteúdo duplicado entre páginas).
 * - Nenhuma promessa de prazo.
 * - Linguagem pra dono de negócio leigo, sem jargão técnico.
 * - CTA sempre aponta pro formulário de contato (/#contato) — mesmo
 *   padrão do resto do site institucional (WhatsApp virou botão
 *   flutuante, não CTA de texto).
 * - Só existe página aqui pra módulo com `disponivel: true` em
 *   lib/modules.ts — não faz sentido gerar demanda pra módulo que
 *   ainda não pode ser contratado (ex: crm, hoje disponivel: false).
 */

export interface SeoSolucao {
  /** Slug do módulo em lib/modules.ts — liga a página ao preço/submenu real */
  moduloSlug: string
  /** <title> da página — mira a busca do problema específico */
  tituloSeo: string
  /** meta description */
  descricaoSeo: string
  /** H1 visível — nomeia o problema, não o produto */
  h1: string
  /** 2-3 frases descrevendo a dor do jeito que o dono de negócio sente, antes de qualquer menção a "sistema" */
  dor: string
  /** 3-5 bullets concretos do que o módulo resolve na prática */
  comoResolve: { titulo: string; desc: string }[]
  /** FAQ específico do problema (também vira JSON-LD FAQPage) */
  faq: { pergunta: string; resposta: string }[]
}

export const SEO_SOLUCOES: Record<string, SeoSolucao> = {
  'controle-de-estoque-sem-planilha': {
    moduloSlug: 'estoque',
    tituloSeo: 'Controle de estoque sem planilha — sistema simples | Omnidesign',
    descricaoSeo:
      'Cansou de planilha de estoque desatualizada e produto que falta na hora errada? Veja como um controle de verdade resolve isso a partir de R$69,90/mês.',
    h1: 'Controle de estoque sem planilha',
    dor:
      'Produto que acaba sem avisar, contagem que nunca bate com o que está na prateleira, planilha que só uma pessoa sabe mexer direito. Quando o estoque vive na cabeça ou numa planilha frágil, todo pedido grande vira um risco — falta o que o cliente quer, ou sobra o que não vende, e ninguém percebe a tempo.',
    comoResolve: [
      {
        titulo: 'Saldo sempre atualizado',
        desc: 'Cada entrada e saída de produto atualiza o saldo na hora — sem depender de ninguém lançar uma planilha à parte.',
      },
      {
        titulo: 'Alerta de estoque mínimo',
        desc: 'O sistema avisa quando um produto está perto de acabar, antes que vire problema com o cliente.',
      },
      {
        titulo: 'Histórico de movimentações',
        desc: 'Toda entrada e saída fica registrada — dá pra ver o que aconteceu com qualquer produto, em qualquer data.',
      },
      {
        titulo: 'Conectado com o resto do sistema',
        desc: 'Usa a mesma base de produtos do módulo de Cadastros — informação digitada uma vez só, sem retrabalho.',
      },
    ],
    faq: [
      {
        pergunta: 'Preciso trocar de sistema todo de uma vez, ou dá pra começar só pelo estoque?',
        resposta:
          'Dá pra começar só pelo módulo de Controle de Estoque — ele funciona sozinho. Se depois fizer sentido, os módulos de Cadastros e Financeiro conversam com ele automaticamente, sem precisar recadastrar nada.',
      },
      {
        pergunta: 'Funciona pelo celular?',
        resposta:
          'Funciona direto pela internet, em qualquer celular ou computador — não precisa instalar nada. É só abrir e usar.',
      },
      {
        pergunta: 'Quanto custa o módulo de Controle de Estoque?',
        resposta:
          'A partir de R$69,90 por mês, sem taxa de criação separada e sem fidelidade — você usa enquanto fizer sentido pro seu negócio.',
      },
    ],
  },

  'fluxo-de-caixa-sem-controle': {
    moduloSlug: 'financeiro',
    tituloSeo: 'Fluxo de caixa sem controle: como organizar de vez | Omnidesign',
    descricaoSeo:
      'Não sabe ao certo quanto tem a pagar e a receber nos próximos dias? Veja como sair da planilha frágil com o módulo Financeiro a partir de R$59,90/mês.',
    h1: 'Fluxo de caixa sem controle',
    dor:
      'Conta que vence sem ninguém ver, cliente que ficou devendo e ninguém cobrou porque ninguém anotou, e a pergunta que ninguém consegue responder com número exato: "quanto eu tenho de verdade pra gastar esse mês?" Sem controle real, toda decisão de comprar, contratar ou dar desconto vira aposta.',
    comoResolve: [
      {
        titulo: 'Contas a pagar e a receber num lugar só',
        desc: 'Cada conta com vencimento, valor e status — sem depender de memória ou de planilha espalhada.',
      },
      {
        titulo: 'Fluxo de caixa projetado',
        desc: 'Veja o que entra e sai nas próximas semanas, não só o que já aconteceu — a diferença entre reagir e planejar.',
      },
      {
        titulo: 'Atraso sinalizado sozinho',
        desc: 'O sistema aponta o que está vencido, sem você precisar caçar conta por conta pra descobrir.',
      },
      {
        titulo: 'Histórico por cliente e fornecedor',
        desc: 'Veja rápido quem está em dia e quem está devendo, sem abrir planilha nenhuma.',
      },
    ],
    faq: [
      {
        pergunta: 'É complicado migrar da planilha que eu já uso?',
        resposta:
          'Não precisa migrar tudo de uma vez. O caminho mais simples é começar registrando só o que vence daqui pra frente — em poucas semanas o fluxo projetado já aparece sozinho, e o histórico antigo você organiza com calma, sem pressa.',
      },
      {
        pergunta: 'O módulo Financeiro conversa com o resto do sistema?',
        resposta:
          'Conversa — usa o mesmo cadastro de clientes e fornecedores do módulo de Cadastros, então a informação é digitada uma vez só e aparece em todos os módulos que você usar.',
      },
      {
        pergunta: 'Quanto custa o módulo Financeiro?',
        resposta:
          'A partir de R$59,90 por mês, sem taxa de criação e sem fidelidade.',
      },
    ],
  },

  'cadastro-de-clientes-desorganizado': {
    moduloSlug: 'cadastros',
    tituloSeo: 'Cadastro de clientes desorganizado: como resolver | Omnidesign',
    descricaoSeo:
      'Dados de cliente espalhados entre WhatsApp, papel e planilha? Veja como organizar clientes, fornecedores e produtos num só lugar a partir de R$39,90/mês.',
    h1: 'Cadastro de clientes desorganizado',
    dor:
      'Telefone de cliente anotado no caderno, endereço perdido numa conversa antiga de WhatsApp, funcionário novo sem saber onde procurar informação de fornecedor. Quando o cadastro está espalhado, toda tarefa simples — ligar pra um cliente, cobrar um fornecedor, saber o que um produto custa — vira caça ao tesouro.',
    comoResolve: [
      {
        titulo: 'Clientes, fornecedores e funcionários organizados',
        desc: 'Cada contato com os dados completos, num só lugar, acessível pra quem precisar — sem depender de uma pessoa só saber onde está tudo.',
      },
      {
        titulo: 'Produtos e serviços com informação central',
        desc: 'Preço, descrição e detalhes de cada produto ou serviço num cadastro único — sem divergência entre o que está anotado em lugares diferentes.',
      },
      {
        titulo: 'Base compartilhada com os outros módulos',
        desc: 'É o cadastro que alimenta o Financeiro e o Estoque — você monta uma vez e os outros módulos já usam essa mesma informação.',
      },
      {
        titulo: 'Busca rápida',
        desc: 'Encontre qualquer cliente ou fornecedor em segundos, sem abrir planilha nem rolar conversa antiga de WhatsApp.',
      },
    ],
    faq: [
      {
        pergunta: 'Dá trabalho migrar os clientes que eu já tenho?',
        resposta:
          'O cadastro inicial dá algum trabalho na primeira vez, como qualquer migração — mas depois de feito, todo cliente novo entra em segundos, e os outros módulos (Financeiro, Estoque) já aproveitam essa mesma base sem retrabalho.',
      },
      {
        pergunta: 'Minha equipe toda pode acessar?',
        resposta:
          'Sim — o módulo funciona direto pela internet, em qualquer celular ou computador, pra quem você der acesso.',
      },
      {
        pergunta: 'Quanto custa o módulo de Cadastros?',
        resposta:
          'A partir de R$39,90 por mês, sem taxa de criação e sem fidelidade.',
      },
    ],
  },
}

/**
 * slug de módulo → slug de problema. Usado pra ligar cada card em
 * components/sections/Modules.tsx (homepage) até a página de SEO
 * correspondente — sem isso, /solucoes/[problema] fica órfã (sem
 * link interno nenhum apontando pra ela), o que prejudica indexação
 * e é diferente do padrão já usado em /modelos (linkado a partir de
 * components/sections/Templates.tsx).
 */
export function getSolucaoSlugByModulo(moduloSlug: string): string | undefined {
  return Object.entries(SEO_SOLUCOES).find(([, s]) => s.moduloSlug === moduloSlug)?.[0]
}
