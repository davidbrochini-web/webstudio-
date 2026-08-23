/**
 * Descrição de cada categoria do blog, usada na página /blog/categoria/[slug].
 * Chave é o slug (slugify() do valor salvo em blog_posts_omnidesign.categoria).
 *
 * Categoria nova sem entrada aqui ainda funciona (fallback genérico em
 * generateMetadata), só sem descrição própria — não é bloqueante,
 * mas vale adicionar aqui quando surgir categoria nova de verdade.
 */
export interface CategoriaBlog {
  label: string
  descricao: string
}

export const CATEGORIAS_BLOG: Record<string, CategoriaBlog> = {
  sites: {
    label: 'Sites',
    descricao:
      'Como criar, reformar e otimizar o site institucional da sua empresa — velocidade, SEO, custo real e sinais de que está na hora de trocar.',
  },
  'sistemas-internos': {
    label: 'Sistemas Internos',
    descricao:
      'Como organizar cadastro de clientes, financeiro e estoque com sistema, sem depender de planilha frágil ou memória.',
  },
  'marketing-digital': {
    label: 'Marketing Digital',
    descricao:
      'Google Ads, ChatGPT Ads, Google Meu Negócio e GEO — como aparecer pra quem já está procurando o seu negócio.',
  },
}
