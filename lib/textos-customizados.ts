// Helper pro sistema de "qualquer texto editável" do projeto especial.
// Em vez de uma coluna nova no banco pra cada heading/subtítulo hardcoded
// (o que viraria uma migration nova a cada pedido de texto), tudo isso
// mora em `sites.textos_customizados` (jsonb key→valor). Chave ausente
// ou string vazia = usa o texto padrão embutido no componente.
//
// Convenção de chave: `<pagina>_<secao>_<campo>`, ex: 'home_stats_1_numero'.

export type TextosCustomizados = Record<string, string>

export function texto(textos: TextosCustomizados | null | undefined, chave: string, padrao: string): string {
  const v = textos?.[chave]
  return v && v.trim() !== '' ? v : padrao
}
