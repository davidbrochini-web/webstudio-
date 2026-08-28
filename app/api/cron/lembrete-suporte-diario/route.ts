import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const EMAIL_DAVID = 'david.brochini@gmail.com'

const TIPO_LABEL: Record<string, string> = {
  erro: '🐞 Erro',
  novo_escopo: '💡 Ideia',
}

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: tickets, error } = await supabase
    .from('suporte_tickets')
    .select('tipo, mensagem, usuario_email, created_at, tenants(nome)')
    .in('status', ['aberto', 'em_andamento'])
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sem chamado em aberto — não manda e-mail nenhum. Só avisa quando
  // tem algo pra fazer, pra não virar ruído diário desnecessário.
  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ ok: true, total: 0, enviado: false })
  }

  const linhas = tickets.map(t => {
    const tenantNome = (t.tenants as unknown as { nome: string } | null)?.nome ?? '—'
    const dias = Math.floor((Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee; font-size:12px; color:#666;">${TIPO_LABEL[t.tipo] ?? t.tipo}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; font-weight:bold;">${tenantNome}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; font-size:13px;">${t.mensagem.slice(0, 100)}${t.mensagem.length > 100 ? '…' : ''}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; font-size:12px; color:#999; white-space:nowrap;">${dias === 0 ? 'hoje' : `${dias}d atrás`}</td>
      </tr>`
  }).join('')

  await sendEmail({
    from: 'Suporte WebStudio <suporte@omnidesign.com.br>',
    to: EMAIL_DAVID,
    subject: `🔔 ${tickets.length} chamado(s) de suporte em aberto`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2>Lembrete diário — chamados de suporte</h2>
        <p style="color:#666;">Você tem <b>${tickets.length}</b> chamado(s) aguardando resposta.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <thead>
            <tr style="text-align:left;">
              <th style="padding:8px; font-size:11px; text-transform:uppercase; color:#999;">Tipo</th>
              <th style="padding:8px; font-size:11px; text-transform:uppercase; color:#999;">Cliente</th>
              <th style="padding:8px; font-size:11px; text-transform:uppercase; color:#999;">Mensagem</th>
              <th style="padding:8px; font-size:11px; text-transform:uppercase; color:#999;">Há</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
        <p style="margin-top:24px;"><a href="https://webstudio-red-eight.vercel.app/admin/suporte">Ver todos no painel →</a></p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true, total: tickets.length, enviado: true })
}
