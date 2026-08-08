import {
  Html, Head, Body, Container, Section, Text, Heading, Row, Column, Hr, Img, Link,
} from '@react-email/components'

const BRAND = '#0EA5A0'
const INK = '#111714'
const MUTED = '#6B7280'
const OFF = '#F4F6F3'
const BORDER = '#E3E7E0'
const GREEN_BG = '#EFFBF4'
const GREEN_TEXT = '#166534'

export interface ConfirmacaoAgendamentoEmailProps {
  siteNome: string
  siteUrl: string
  logoUrl?: string | null
  telefoneContato?: string | null
  enderecoContato?: string | null
  pacienteNome: string
  tipoConsulta?: string | null
  data: string
  horaInicio: string
  horaFim: string
}

export default function ConfirmacaoAgendamentoEmail({
  siteNome, siteUrl, logoUrl, telefoneContato, enderecoContato,
  pacienteNome, tipoConsulta, data, horaInicio, horaFim,
}: ConfirmacaoAgendamentoEmailProps) {
  const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, Arial, sans-serif', backgroundColor: '#fff', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
          {logoUrl && (
            <Img src={logoUrl} alt={siteNome} width={48} height={48} style={{ borderRadius: 10, marginBottom: 16, objectFit: 'contain' }} />
          )}

          <Section style={{ backgroundColor: GREEN_BG, borderRadius: 8, padding: '6px 16px', marginBottom: 16 }}>
            <Text style={{ color: GREEN_TEXT, fontSize: 12, fontWeight: 700, margin: 0 }}>
              ✓ Consulta confirmada
            </Text>
          </Section>

          <Heading style={{ color: INK, fontSize: 20, margin: '0 0 4px' }}>Olá, {pacienteNome}!</Heading>
          <Text style={{ color: MUTED, fontSize: 13, margin: '0 0 20px' }}>
            Sua consulta em {siteNome} está confirmada. Segue os detalhes:
          </Text>

          <Section style={{ backgroundColor: OFF, borderRadius: 12, padding: '4px 20px' }}>
            {tipoConsulta && (
              <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, width: 110 }}>Tipo de consulta</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14, fontWeight: 700 }}>{tipoConsulta}</Column>
              </Row>
            )}
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Data</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14, textTransform: 'capitalize' }}>{dataFormatada}</Column>
            </Row>
            <Row style={{ borderBottom: enderecoContato ? `1px solid ${BORDER}` : undefined }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Horário</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{horaInicio.slice(0, 5)} às {horaFim.slice(0, 5)}</Column>
            </Row>
            {enderecoContato && (
              <Row>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, verticalAlign: 'top' }}>Local</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{enderecoContato}</Column>
              </Row>
            )}
          </Section>

          <Text style={{ color: MUTED, fontSize: 12.5, marginTop: 20, lineHeight: 1.5 }}>
            Precisa remarcar ou cancelar? Acesse &ldquo;Meus Agendamentos&rdquo; no site
            {telefoneContato ? <> ou chame no <strong>{telefoneContato}</strong></> : null}.
          </Text>

          <Hr style={{ borderColor: BORDER, margin: '24px 0 12px' }} />
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>
            <Link href={siteUrl} style={{ color: '#9CA3AF' }}>{siteUrl.replace('https://', '')}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
