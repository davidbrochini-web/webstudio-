import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { getTemplateProposta } from '@/lib/proposta-templates'

const BRAND = '#0EA5A0'
const INK = '#111714'
const MUTED = '#6B7280'
const BORDER = '#E3E7E0'
const DARK = '#111714'

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, color: INK, fontFamily: 'Helvetica' },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: MUTED, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },

  // Capa
  capaWrap: { flex: 1, justifyContent: 'center' },
  capaTag: { fontSize: 10, color: BRAND, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 8 },
  capaTitulo: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 10 },
  capaTagline: { fontSize: 13, color: MUTED, marginBottom: 40 },
  capaMeta: { fontSize: 9, color: MUTED },

  // Conteúdo geral
  kicker: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BRAND, letterSpacing: 1, marginBottom: 4 },
  h1: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 4 },
  hrRed: { width: 40, height: 3, backgroundColor: BRAND, marginBottom: 20 },
  paragrafo: { fontSize: 10.5, color: INK, lineHeight: 1.5, marginBottom: 14 },

  diagCard: { backgroundColor: '#F4F6F3', borderRadius: 8, padding: 14, marginBottom: 12 },
  diagLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 3 },
  diagValor: { fontSize: 9.5, color: MUTED, lineHeight: 1.4 },

  escopoItem: { marginBottom: 14 },
  escopoTitulo: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 3 },
  escopoDesc: { fontSize: 9.5, color: MUTED, lineHeight: 1.4 },

  // Mockup
  mockNav: { backgroundColor: DARK, borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mockLogo: { width: 26, height: 26, borderRadius: 4, objectFit: 'contain', backgroundColor: '#fff' },
  mockNavNome: { color: '#fff', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  mockHero: { backgroundColor: DARK, padding: 20, paddingTop: 4 },
  mockHeroTitulo: { color: '#fff', fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 6, maxWidth: 300 },
  mockBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: '#fff', padding: 12 },
  mockBadge: { backgroundColor: '#F4F6F3', borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8, fontSize: 8, fontFamily: 'Helvetica-Bold', color: INK, flexGrow: 1, textAlign: 'center' },
  mockGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', paddingHorizontal: 12, paddingBottom: 12, gap: 6 },
  mockImg: { width: 108, height: 80, borderRadius: 4, objectFit: 'cover' },
  mockFooter: { backgroundColor: DARK, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, padding: 12 },
  mockFooterTexto: { color: '#fff', fontSize: 8.5 },

  // JPG pronto (subido pelo atendente) em vez da montagem automática
  mockJpgWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  mockJpg: { width: '100%', borderRadius: 8, objectFit: 'contain' },

  ctaFinal: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  ctaTitulo: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 10, maxWidth: 380 },
  ctaTexto: { fontSize: 10.5, color: MUTED, lineHeight: 1.5, maxWidth: 380, marginBottom: 24 },
})

function Footer({ nome, pagina }: { nome: string; pagina: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{nome} — Proposta de Site</Text>
      <Text>{pagina}</Text>
    </View>
  )
}

export interface PropostaLeadData {
  nome: string
  segmento: string | null
  bairro: string | null
  endereco: string | null
  telefone: string | null
  notaGoogle: number | null
  avaliacoesGoogle: number | null
  logoUrl: string | null
  imagensPortfolio: string[]
  homeMockupUrl: string | null
  responsavelNome: string | null
  responsavelEmail: string | null
}

export default function PropostaDocument({ lead }: { lead: PropostaLeadData }) {
  const tpl = getTemplateProposta(lead.segmento)
  const hoje = new Date().toLocaleDateString('pt-BR')
  const temMockupAuto = Boolean(lead.logoUrl) || lead.imagensPortfolio.length > 0
  const temMockupJpg = Boolean(lead.homeMockupUrl)
  const temMockup = temMockupJpg || temMockupAuto

  return (
    <Document>
      {/* Capa */}
      <Page size="A4" style={styles.page}>
        <View style={styles.capaWrap}>
          <Text style={styles.capaTag}>PROPOSTA DE SITE</Text>
          <Text style={styles.capaTitulo}>{lead.nome}</Text>
          <Text style={styles.capaTagline}>{tpl.tagline}</Text>
          <Text style={styles.capaMeta}>Preparado por Omnidesign • {hoje}</Text>
        </View>
        <Footer nome={lead.nome} pagina="02" />
      </Page>

      {/* Diagnóstico */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>DIAGNÓSTICO</Text>
        <Text style={styles.h1}>Onde vocês estão hoje</Text>
        <View style={styles.hrRed} />
        <Text style={styles.paragrafo}>
          Hoje, {tpl.diagnosticoIntro}
        </Text>

        {(lead.notaGoogle != null || lead.avaliacoesGoogle != null) && (
          <View style={styles.diagCard}>
            <Text style={styles.diagLabel}>Reputação no Google</Text>
            <Text style={styles.diagValor}>
              Nota {lead.notaGoogle ?? '—'} com {lead.avaliacoesGoogle ?? 0} avaliações — mas essa informação vive só no Google, sem um site próprio pra reforçar a confiança de quem pesquisa.
            </Text>
          </View>
        )}

        {lead.bairro && (
          <View style={styles.diagCard}>
            <Text style={styles.diagLabel}>Região</Text>
            <Text style={styles.diagValor}>{lead.bairro}{lead.endereco ? ` — ${lead.endereco}` : ''}</Text>
          </View>
        )}

        <View style={styles.diagCard}>
          <Text style={styles.diagLabel}>Onde dá pra chegar</Text>
          <Text style={styles.diagValor}>
            Um site com a cara do negócio de vocês, endereço/horário/WhatsApp sempre visíveis, e chance real de aparecer no Google quando alguém procura {lead.segmento?.toLowerCase() ?? 'o serviço de vocês'} na região.
          </Text>
        </View>
        <Footer nome={lead.nome} pagina="03" />
      </Page>

      {/* Escopo */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>ESCOPO</Text>
        <Text style={styles.h1}>O que o site vai ter</Text>
        <View style={styles.hrRed} />
        {tpl.escopo.map(item => (
          <View key={item.titulo} style={styles.escopoItem}>
            <Text style={styles.escopoTitulo}>{item.titulo}</Text>
            <Text style={styles.escopoDesc}>{item.descricao}</Text>
          </View>
        ))}
        <Footer nome={lead.nome} pagina="04" />
      </Page>

      {/* Mockup — JPG pronto do atendente tem prioridade; senão monta
          automático com logo + fotos; se não tiver nada, a página nem entra */}
      {temMockup && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.kicker}>IDEIA VISUAL</Text>
          <Text style={styles.h1}>Como a home pode ficar</Text>
          <View style={styles.hrRed} />

          {temMockupJpg ? (
            <View style={styles.mockJpgWrap}>
              <Image src={lead.homeMockupUrl!} style={styles.mockJpg} />
            </View>
          ) : (
            <View>
              {/* ===== BROWSER FRAME ===== */}
              <View style={{ backgroundColor: '#F3F4F6', borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' }} />
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' }} />
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#D1D5DB' }} />
                </View>
                <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 }}>
                  <Text style={{ fontSize: 7, color: MUTED }}>{lead.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br</Text>
                </View>
              </View>

              {/* ===== NAV ===== */}
              <View style={{ backgroundColor: DARK, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {lead.logoUrl && <Image src={lead.logoUrl} style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'contain', backgroundColor: '#fff' }} />}
                  <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Helvetica-Bold' }}>{lead.nome}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  {tpl.categorias.slice(0, 3).map(c => (
                    <Text key={c} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 7 }}>{c}</Text>
                  ))}
                  <View style={{ backgroundColor: '#25D366', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>WhatsApp</Text>
                  </View>
                </View>
              </View>

              {/* ===== HERO com foto de fundo ===== */}
              <View style={{ backgroundColor: DARK, paddingHorizontal: 20, paddingVertical: 24, position: 'relative', minHeight: 100 }}>
                {lead.imagensPortfolio.length > 0 && (
                  <Image src={lead.imagensPortfolio[0]} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                )}
                <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 6, maxWidth: 320, position: 'relative' }}>{tpl.tagline}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, marginBottom: 12, position: 'relative' }}>{lead.bairro ? `${lead.segmento ?? ''} · ${lead.bairro}` : (lead.segmento ?? '')}</Text>
                <View style={{ flexDirection: 'row', gap: 8, position: 'relative' }}>
                  <View style={{ backgroundColor: BRAND, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 14 }}>
                    <Text style={{ color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold' }}>Entre em contato</Text>
                  </View>
                  <View style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 4, paddingVertical: 5, paddingHorizontal: 14 }}>
                    <Text style={{ color: '#fff', fontSize: 8 }}>Nossos servicos</Text>
                  </View>
                </View>
              </View>

              {/* ===== SERVIÇOS (categorias como cards) ===== */}
              <View style={{ backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 8 }}>Nossos servicos</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tpl.categorias.map(c => (
                    <View key={c} style={{ backgroundColor: '#F4F6F3', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, flexGrow: 1 }}>
                      <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: INK, textAlign: 'center' }}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* ===== INSTAGRAM FEED — a estrela do produto ===== */}
              {lead.imagensPortfolio.length > 0 && (
                <View style={{ backgroundColor: '#FAFAF5', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>{lead.nome[0]}</Text>
                      </View>
                      <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: INK }}>@{lead.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' }} />
                      <Text style={{ fontSize: 7, color: '#22C55E', fontFamily: 'Helvetica-Bold' }}>Sincronizado todo dia</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {lead.imagensPortfolio.slice(0, 4).map((url, i) => (
                      <View key={i} style={{ flex: 1 }}>
                        <Image src={url} style={{ width: '100%', height: 90, borderRadius: 6, objectFit: 'cover' }} />
                        <Text style={{ fontSize: 6.5, color: MUTED, marginTop: 3 }}>❤ {Math.floor(40 + Math.random() * 180)} curtidas</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontSize: 7, color: MUTED, textAlign: 'center', marginTop: 8 }}>
                    Posts e reels que voce postar no Instagram entram aqui sozinhos, todo dia
                  </Text>
                </View>
              )}

              {/* ===== RODAPÉ ===== */}
              <View style={{ backgroundColor: DARK, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>
                  {lead.endereco ?? lead.bairro ?? ''}{lead.telefone ? `  ·  ${lead.telefone}` : ''}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7 }}>omnidesign.com.br</Text>
              </View>
            </View>
          )}

          <Text style={{ fontSize: 8, color: MUTED, marginTop: 10 }}>
            {temMockupJpg
              ? 'Mockup preparado pela nossa equipe pra visualizacao.'
              : 'Ideia de direcao visual — o layout final ganha ainda mais refinamento na conversa.'}
          </Text>
          <Footer nome={lead.nome} pagina="05" />
        </Page>
      )}

      {/* Próximo passo */}
      <Page size="A4" style={styles.page}>
        <View style={styles.ctaFinal}>
          <Text style={styles.ctaTitulo}>Vamos marcar essa conversa?</Text>
          <Text style={styles.ctaTexto}>
            É só responder essa mensagem com um dia e horário que funcione pra vocês — presencial ou por chamada de vídeo. Sem compromisso: a conversa é só pra entender a necessidade direito, 20 a 30 minutos. Depois disso, a proposta final sai com escopo, prazo e valor já fechados.
          </Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: INK }}>
            {lead.responsavelNome ?? 'Omnidesign'}
          </Text>
          <Text style={{ fontSize: 9, color: MUTED }}>
            {lead.responsavelEmail ?? 'omnidesign.com.br'}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
