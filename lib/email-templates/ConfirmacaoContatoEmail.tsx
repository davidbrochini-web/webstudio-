import { Html, Head, Body, Container, Text, Heading, Hr } from '@react-email/components'

const INK = '#111714'
const MUTED = '#6B7280'
const BORDER = '#E3E7E0'

export interface ConfirmacaoContatoEmailProps {
  siteNome: string
  nomeVisitante: string
}

/**
 * Confirmação simples de "recebemos sua mensagem" — diferente de
 * ConfirmacaoAgendamentoEmail, que é específico pra quem marcou um
 * horário. Esse é genérico pra qualquer formulário de contato.
 */
export default function ConfirmacaoContatoEmail({ siteNome, nomeVisitante }: ConfirmacaoContatoEmailProps) {
  const primeiroNome = nomeVisitante.trim().split(' ')[0]

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, Arial, sans-serif', backgroundColor: '#fff', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
          <Heading style={{ color: INK, fontSize: 20, margin: '0 0 12px' }}>Oi, {primeiroNome}!</Heading>
          <Text style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
            Recebemos sua mensagem por aqui e vamos te responder em breve — geralmente no mesmo dia útil.
          </Text>
          <Text style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
            Se preferir adiantar por WhatsApp, é só chamar direto pelo site.
          </Text>
          <Hr style={{ borderColor: BORDER, margin: '24px 0 12px' }} />
          <Text style={{ color: INK, fontSize: 14 }}>Até já,<br /><strong>Equipe {siteNome}</strong></Text>
        </Container>
      </Body>
    </Html>
  )
}
