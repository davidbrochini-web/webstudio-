// Fonte única de verdade pro mapeamento domínio customizado → path interno
// do projeto especial. Usado por:
// - proxy.ts (rewrite de URL pro visitante)
// - lib/dentista-joao.ts / equivalentes de outros projetos especiais
//   (pra saber quando gerar links "limpos", sem o prefixo interno)
//
// Import seguro em Edge Runtime (proxy.ts) — sem dependências.
export const DOMAIN_MAP: Record<string, string> = {
  'drjoaobucomaxilofacial.com.br': '/projetos-especiais/dentista-joao',
  'www.drjoaobucomaxilofacial.com.br': '/projetos-especiais/dentista-joao',
  'casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
  'www.casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
}
