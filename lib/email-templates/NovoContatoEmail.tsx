import {
  Html, Head, Body, Container, Section, Text, Heading, Row, Column, Hr, Img,
} from '@react-email/components'

const BRAND = '#0EA5A0'
const INK = '#111714'
const MUTED = '#6B7280'
const OFF = '#F4F6F3'
const BORDER = '#E3E7E0'

export interface NovoContatoEmailProps {
  siteNome: string
  siteUrl: string
  logoUrl?: string | null
  nome: string
  contato: string
  mensagem?: string | null
  dataDesejada?: string | null
  periodo?: string | null
}

export default function NovoContatoEmail({
  siteNome, siteUrl, logoUrl, nome, contato, mensagem, dataDesejada, periodo,
}: NovoContatoEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: '-apple-system, Arial, sans-serif', backgroundColor: '#fff', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
          {logoUrl && (
            <Img src={logoUrl} alt={siteNome} width={48} height={48} style={{ borderRadius: 10, marginBottom: 16, objectFit: 'contain' }} />
          )}
          <Heading style={{ color: INK, fontSize: 20, margin: '0 0 4px' }}>Novo contato — {siteNome}</Heading>
          <Text style={{ color: MUTED, fontSize: 13, margin: '0 0 20px' }}>
            Formulário do site <a href={siteUrl} style={{ color: BRAND }}>{siteUrl.replace('https://', '')}</a>
          </Text>

          <Section style={{ backgroundColor: OFF, borderRadius: 12, padding: '4px 20px' }}>
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, width: 110 }}>Nome</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14, fontWeight: 700 }}>{nome}</Column>
            </Row>
            <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
              <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Contato</Column>
              <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{contato}</Column>
            </Row>
            {mensagem && (
              <Row style={{ borderBottom: `1px solid ${BORDER}` }}>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12, verticalAlign: 'top' }}>Mensagem</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>{mensagem}</Column>
              </Row>
            )}
            {(dataDesejada || periodo) && (
              <Row>
                <Column style={{ padding: '10px 0', color: MUTED, fontSize: 12 }}>Data desejada</Column>
                <Column style={{ padding: '10px 0', color: INK, fontSize: 14 }}>
                  {dataDesejada ? new Date(dataDesejada + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                  {periodo ? ` — ${periodo === 'manha' ? 'Manhã' : 'Tarde'}` : ''}
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={{ borderColor: BORDER, margin: '24px 0 12px' }} />
          <Text style={{ color: '#9CA3AF', fontSize: 11 }}>Enviado automaticamente pelo sistema Omnidesign.</Text>
        </Container>
      </Body>
    </Html>
  )
}
