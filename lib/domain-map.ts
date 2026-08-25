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
  // Domínio novo (23/08) — cliente comprou drjoaovictorpimenta.com.br,
  // mais pessoal/de marca que o antigo (que descreve a especialidade).
  // Os dois ficam mapeados em paralelo até o corte final: DNS ainda
  // em transição no registro.br quando isso foi adicionado, e
  // SITE_URL_BASE (lib/dentista-joao.ts) só muda pro domínio novo
  // depois de confirmado que ele resolve de verdade — evita quebrar
  // link de confirmação de agendamento real de paciente durante a
  // propagação. Depois do corte, o antigo vira redirect 301 pro novo.
  'drjoaovictorpimenta.com.br': '/projetos-especiais/dentista-joao',
  'www.drjoaovictorpimenta.com.br': '/projetos-especiais/dentista-joao',
  'casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
  'www.casosesquecidos.com.br': '/projetos-especiais/casos-esquecidos',
  // Colégio Elite: entrada comentada até o domínio elite.g12.br ser
  // migrado de verdade (ver PROJETO_ESPECIAL_COLEGIO_ELITE.md) — por
  // enquanto o site só existe no fallback .vercel.app, pra homologação.
  // 'elite.g12.br': '/projetos-especiais/colegio-elite',
  // 'www.elite.g12.br': '/projetos-especiais/colegio-elite',
}
