// Fonte única de verdade pro mapeamento domínio customizado → path interno
// do projeto especial. Usado por:
// - proxy.ts (rewrite de URL pro visitante)
// - lib/dentista-joao.ts / equivalentes de outros projetos especiais
//   (pra saber quando gerar links "limpos", sem o prefixo interno)
//
// Import seguro em Edge Runtime (proxy.ts) — sem dependências.
export const DOMAIN_MAP: Record<string, string> = {
  // Domínio antigo (drjoaobucomaxilofacial.com.br) removido daqui em
  // 28/08 — a migração pro domínio novo foi concluída e o antigo
  // virou redirect 308 configurado na borda da Vercel (nível de
  // domínio), então tráfego pra ele nunca chega a esse mapeamento.
  // Confirmado como código morto por auditoria antes de remover.
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
