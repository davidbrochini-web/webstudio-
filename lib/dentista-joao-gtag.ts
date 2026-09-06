// Rastreamento de conversão do Google Ads — site Dr. João Victor Pimenta.
// Tag base carregada no PageShell; eventos disparados nos pontos de conversão:
// - Envio do formulário de agendamento (AgendamentoForm)
// - Clique no botão flutuante de WhatsApp (WhatsAppFloat)

export const GADS_TAG_ID = 'AW-11027488126'
export const CONV_AGENDAMENTO = 'AW-11027488126/tGVkCKvP_u8cEP66qIop'
export const CONV_WHATSAPP = 'AW-11027488126/1jQRCK7P_u8cEP66qIop'

type GtagFn = (...args: unknown[]) => void

export function reportConversion(sendTo: string) {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', { send_to: sendTo })
  }
}
