import {
  Html, Head, Body, Container, Section, Text, Heading, Row, Column, Hr, Img, Link,
} from '@react-email/components'

const BRAND = '#0EA5A0'
const INK = '#111714'
const MUTED = '#6B7280'
const OFF = '#F4F6F3'
const BORDER = '#E3E7E0'
const AMBER_BG = '#FFF8E6'
const AMBER_TEXT = '#8A5A00'

export interface NovoAgendamentoEmailProps {
  siteNome: string
  siteUrl: string
  logoUrl?: string | null
  painelUrl: string
  pacienteNome: string
  pacienteTelefone: string
  pacienteEmail: string
  tipoConsulta?: string | null
  data: string
  horaInicio: string
  horaFim: string
  mensagem?: string | null
}

export default function NovoAgendamentoEmail({
  siteNome, siteUrl, logoUrl, painelUrl,
  pacienteNome, pacienteTelefone, pacienteEmail,
  tipoConsulta, data, horaInicio, horaFim, mensagem,
}: NovoAgendamentoEmailProps) {
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

          <Section style={{ backgroundColor: AMBER_BG, borderRadius: 8, padding: '6px 16px', marginBottom: 16 }}>
            <Text style={{ color: AMBER_TEXT, fontSize: 12, fontWeight: 700, margin: 0 }}>
              Aguardando sua confirmação
            </Text>
          </Section>

          <Heading style={{ color: INK, fontSize: 20, margin: '0 0 4px' }}>Novo agendamento — {siteNome}</Heading>
          <Text style={{ color: MUTED, fontSize: 13, margin: '0 0 20px' }}>
            Um paciente marcou horário pelo site. Confirme ou recuse no painel.
          </Text>

          <Section style={{ backgroundColor: OFF, borderRadius: 12, padding: '4px 20px' }}>
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, width: 110 }}>Paciente</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14, fontWeight: 700 }}>{pacienteNome}</Column>
            </Row>
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Telefone</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{pacienteTelefone}</Column>
            </Row>
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>E-mail</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{pacienteEmail}</Column>
            </Row>
            {tipoConsulta && (
              <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Tipo de consulta</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{tipoConsulta}</Column>
              </Row>
            )}
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Data</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14, textTransform: 'capitalize' }}>{dataFormatada}</Column>
            </Row>
            <Row style={{ borderBottom: mensagem ? `1px solid ${BORDER}` : undefined }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Horário</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{horaInicio.slice(0, 5)} às {horaFim.slice(0, 5)}</Column>
            </Row>
            {mensagem && (
              <Row>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, verticalAlign: 'top' }}>Mensagem</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{mensagem}</Column>
              </Row>
            )}
          </Section>

          <Link href={painelUrl} style={{
            display: 'inline-block', marginTop: 20, backgroundColor: BRAND, color: '#fff',
            padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}>
            Ver na agenda →
          </Link>

          <Hr style={{ borderColor: BORDER, margin: '24px 0 12px' }} />
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>
            Enviado automaticamente pelo sistema Omnidesign — <Link href={siteUrl} style={{ color: '#9CA3AF' }}>{siteUrl.replace('https://', '')}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
