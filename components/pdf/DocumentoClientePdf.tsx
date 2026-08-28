import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const BRAND = '#0EA5A0'
const INK = '#111714'
const MUTED = '#6B7280'
const BORDER = '#E3E7E0'

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, color: INK, fontFamily: 'Helvetica' },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: MUTED, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  capaTag: { fontSize: 10, color: BRAND, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 10 },
  capaTitulo: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: INK, marginBottom: 6 },
  capaMeta: { fontSize: 9, color: MUTED },
  h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 18, marginBottom: 8 },
  h2: { fontSize: 12.5, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 4, marginBottom: 4 },
  paragrafo: { fontSize: 10.5, color: INK, lineHeight: 1.55, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', marginBottom: 5 },
  bulletDot: { width: 10, fontSize: 10.5, color: BRAND },
  bulletTexto: { flex: 1, fontSize: 10.5, color: INK, lineHeight: 1.5 },
  numRow: { flexDirection: 'row', marginBottom: 6 },
  numCircle: { width: 16, height: 16, borderRadius: 8, backgroundColor: BRAND, color: '#fff', fontSize: 8.5, fontFamily: 'Helvetica-Bold', textAlign: 'center', paddingTop: 3, marginRight: 8 },
  numTexto: { flex: 1, fontSize: 10.5, color: INK, lineHeight: 1.5 },
  hr: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 14 },
})

function Footer({ nome, pagina }: { nome: string; pagina: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{nome}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pagina} — ${pageNumber}/${totalPages}`} />
    </View>
  )
}

/** Parser bem simples do mesmo subset de markdown usado no
 *  DocumentacaoModal.tsx (client) — mantém os dois sincronizados
 *  manualmente, o conteúdo é sempre o mesmo texto vindo do banco. */
function renderLinhas(conteudo: string, tituloCapa: string) {
  const linhas = conteudo.split('\n')
  const blocos: React.ReactNode[] = []
  let primeiroH1Pulado = false

  linhas.forEach((linhaOriginal, i) => {
    const linha = linhaOriginal.trimStart()
    if (linha.startsWith('# ')) {
      // O H1 do markdown normalmente repete o título — já mostrado
      // na capa (styles.capaTitulo). Pula só a primeira ocorrência
      // pra não duplicar; um segundo "# " (incomum) ainda renderiza.
      if (!primeiroH1Pulado && linha.slice(2).trim() === tituloCapa.trim()) {
        primeiroH1Pulado = true
        return
      }
      blocos.push(<Text key={i} style={styles.h1}>{linha.slice(2)}</Text>)
    } else if (linha.startsWith('## ')) {
      blocos.push(<Text key={i} style={styles.h1}>{linha.slice(3)}</Text>)
    } else if (linha.startsWith('### ')) {
      blocos.push(<Text key={i} style={styles.h2}>{linha.slice(4)}</Text>)
    } else if (linha.trim() === '---') {
      blocos.push(<View key={i} style={styles.hr} />)
    } else if (linha.startsWith('- ')) {
      blocos.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletTexto}>{renderInlinePdf(linha.slice(2))}</Text>
        </View>
      )
    } else if (/^\d+\.\s/.test(linha)) {
      const m = linha.match(/^(\d+)\.\s(.*)/)!
      blocos.push(
        <View key={i} style={styles.numRow}>
          <Text style={styles.numCircle}>{m[1]}</Text>
          <Text style={styles.numTexto}>{renderInlinePdf(m[2])}</Text>
        </View>
      )
    } else if (linha.startsWith('_') && linha.endsWith('_') && linha.length > 1) {
      blocos.push(<Text key={i} style={{ fontSize: 8.5, color: MUTED, marginTop: 10 }}>{linha.slice(1, -1)}</Text>)
    } else if (linha.trim() !== '') {
      blocos.push(<Text key={i} style={styles.paragrafo}>{renderInlinePdf(linha)}</Text>)
    }
  })

  return blocos
}

// React-PDF suporta <Text> aninhado com estilo próprio — usamos isso
// pra manter o **negrito** de verdade em vez de só tirar os marcadores.
function renderInlinePdf(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{p.slice(2, -2)}</Text>
      : <Text key={i}>{p}</Text>
  )
}

export default function DocumentoClientePdf({
  titulo,
  conteudo,
  tenantNome,
}: {
  titulo: string
  conteudo: string
  tenantNome: string
}) {
  const hoje = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.capaTag}>OMNIDESIGN</Text>
        <Text style={styles.capaTitulo}>{titulo}</Text>
        <Text style={styles.capaMeta}>{tenantNome} · Gerado em {hoje}</Text>
        <View style={styles.hr} />
        {renderLinhas(conteudo, titulo)}
        <Footer nome={tenantNome} pagina={titulo} />
      </Page>
    </Document>
  )
}
