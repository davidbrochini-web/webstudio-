import { sendEmail } from '@/lib/email'
import type { RelatorioGoogleAds } from '@/lib/google-ads-resumo'

// Relatório de desempenho do Google Ads para o cliente. Remetente da
// Omnidesign (é a agência prestando contas, não o sistema do consultório),
// com resposta indo pro David. Só números, sem interpretação automática:
// a leitura dos resultados é conversa do David com o cliente.

const FROM = 'Omnidesign <relatorios@omnidesign.com.br>'
const ADMIN = 'david.brochini@gmail.com'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const int = (v: number) => v.toLocaleString('pt-BR')
const pct = (v: number) => (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
const dm = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const semana = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Texto livre vindo do body: escapa tudo e só então converte **x** em negrito.
const paragrafos = (ps: string[] | undefined, destaque = false) => (ps ?? [])
  .map(p => `<p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;${destaque ? 'background:#f4f7f4;padding:14px;border-radius:10px;' : ''}">${
    escapeHtml(p).replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0A0F0B;">$1</strong>')}</p>`)
  .join('')

const TH = 'padding:6px 4px;font-size:11px;color:#888;text-align:right;font-weight:normal;border-bottom:1px solid #eee;'
const TD = 'padding:6px 4px;font-size:13px;color:#2a2a2a;text-align:right;border-bottom:1px solid #f3f3f3;'
const TDL = TD.replace('text-align:right', 'text-align:left')

const card = (rotulo: string, valor: string) => `
  <td width="33%" style="padding:4px;">
    <div style="background:#f4f7f4;border-radius:10px;padding:12px 8px;text-align:center;">
      <p style="margin:0;font-size:18px;color:#0A0F0B;font-weight:bold;">${valor}</p>
      <p style="margin:4px 0 0;font-size:11px;color:#666;">${rotulo}</p>
    </div>
  </td>`

export async function enviarRelatorioGoogleAds(params: {
  emailDestino: string | null
  saudacao?: string
  rel: RelatorioGoogleAds
  /** Parágrafos livres (texto puro; **negrito** permitido) antes dos números e depois deles. */
  abertura?: string[]
  fechamento?: string[]
  assunto?: string
}): Promise<{ enviado: boolean }> {
  const { rel } = params
  if (!params.emailDestino || !rel.disponivel) return { enviado: false }

  const t = rel.totais
  const ctr = t.impressoes ? t.cliques / t.impressoes : 0
  const cpc = t.cliques ? t.custo / t.cliques : 0
  const periodo = `${dm(rel.desde)} a ${dm(rel.ate)}`

  const linhasCamp = rel.campanhas.map(c => `
    <tr>
      <td style="${TDL}">${escapeHtml(c.nome.replace(/\s*-\s*Tucuruvi.*$/, ''))}</td>
      <td style="${TD}">${int(c.impressoes)}</td>
      <td style="${TD}">${int(c.cliques)}</td>
      <td style="${TD}">${brl(c.custo)}</td>
    </tr>`).join('')

  const linhasDia = rel.porDia.map(d => `
    <tr>
      <td style="${TDL}">${dm(d.data)} <span style="color:#aaa;">${semana(d.data)}</span></td>
      <td style="${TD}">${int(d.impressoes)}</td>
      <td style="${TD}">${int(d.cliques)}</td>
      <td style="${TD}">${brl(d.custo)}</td>
    </tr>`).join('')

  const linhasKw = rel.keywords.map(k => `
    <tr>
      <td style="${TDL}">${escapeHtml(k.texto)}</td>
      <td style="${TD}">${int(k.impressoes)}</td>
      <td style="${TD}">${int(k.cliques)}</td>
    </tr>`).join('')

  const tabela = (cab: string[], linhas: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>${cab.map((c, i) => `<th style="${i === 0 ? TH.replace('text-align:right', 'text-align:left') : TH}">${c}</th>`).join('')}</tr>
      ${linhas}
    </table>`

  const titulo = (s: string) => `<p style="margin:20px 0 8px;font-size:13px;color:#0A0F0B;font-weight:bold;">${s}</p>`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0A0F0B;padding:20px 28px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">omnidesign</p>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 6px;font-size:18px;color:#0A0F0B;">Relatório Google Ads</h1>
          <p style="margin:0 0 16px;font-size:13px;color:#666;">${periodo}</p>
          <p style="margin:0 0 16px;font-size:14px;color:#444;">Olá${params.saudacao ? `, ${escapeHtml(params.saudacao)}` : ''}!${params.abertura?.length ? '' : ' Segue o resumo das suas campanhas no Google desde o início da veiculação.'}</p>
          ${paragrafos(params.abertura)}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">
            <tr>${card('Impressões', int(t.impressoes))}${card('Cliques', int(t.cliques))}${card('Investido', brl(t.custo))}</tr>
            <tr>${card('Taxa de clique', pct(ctr))}${card('Custo por clique', brl(cpc))}${card('Contatos pelo anúncio', int(Math.round(t.conversoes)))}</tr>
          </table>
          ${rel.saldoDisponivel !== null ? `<p style="margin:8px 0 0;font-size:12px;color:#666;text-align:center;">Saldo disponível na conta: <strong style="color:#0A0F0B;">${brl(rel.saldoDisponivel)}</strong></p>` : ''}

          ${titulo('Por campanha')}
          ${tabela(['Campanha', 'Impr.', 'Cliques', 'Investido'], linhasCamp)}

          ${titulo('Dia a dia')}
          ${tabela(['Dia', 'Impr.', 'Cliques', 'Investido'], linhasDia)}

          ${rel.keywords.length ? titulo('Principais buscas que mostraram seu anúncio') + tabela(['Palavra-chave', 'Impr.', 'Cliques'], linhasKw) : ''}

          <p style="margin:8px 0 0;font-size:12px;color:#888;">Impressões: vezes em que o anúncio apareceu no Google. Cliques: pessoas que clicaram para ver o site. Contatos pelo anúncio: agendamentos, WhatsApp e ligações registrados a partir do anúncio.</p>
          <div style="margin:20px 0 0;">${paragrafos(params.fechamento, true)}</div>
          <p style="margin:16px 0 0;font-size:14px;color:#444;">Qualquer dúvida, é só responder este e-mail.</p>
          <p style="margin:8px 0 0;font-size:14px;color:#444;">Um abraço,<br><strong>Equipe Omnidesign</strong></p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f9f9f9;">
          <p style="margin:0;font-size:11px;color:#999;">Dados extraídos do Google Ads no momento do envio. O dia de hoje é parcial.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const r = await sendEmail({
    from: FROM,
    to: params.emailDestino,
    cc: ADMIN,
    replyTo: ADMIN,
    subject: params.assunto ?? `Relatório Google Ads — ${periodo}: ${int(t.cliques)} cliques, ${int(t.impressoes)} impressões`,
    html,
  })
  return { enviado: r.ok }
}
