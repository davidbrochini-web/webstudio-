/**
 * Telefones de lead são texto livre ("(11) 99999-0000", "+55 11 98765-4321"
 * etc — ver leads_omnidesign.telefone). Pra montar um link wa.me precisa
 * só dígitos, com código do país na frente. Assume Brasil (55) quando o
 * número não já vem com código de país (10-11 dígitos = DDD + número).
 */
export function linkWhatsapp(telefone: string, texto: string): string | null {
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.length < 10) return null

  const comCodigoPais = digitos.length <= 11 ? `55${digitos}` : digitos
  return `https://wa.me/${comCodigoPais}?text=${encodeURIComponent(texto)}`
}
