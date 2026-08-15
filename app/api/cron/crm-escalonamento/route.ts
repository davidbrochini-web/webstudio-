import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Mesmo padrão dos crons do Dentista João (ver lib/email.ts, lib/dentista-joao-email.ts):
// e-mail de gestão vai pro inbox real do David, não pro login de auth.
const GESTOR_EMAIL = 'david@omnidesign.com.br'
const FROM = 'Omnidesign CRM <leads@omnidesign.com.br>'

const ROTULOS_ESCALONAMENTO: Record<string, string> = {
  juridico: 'pergunta jurídica/contratual',
  mudanca_escopo: 'mudança de escopo em cliente ativo',
  pedido_desconto: 'pedido de desconto',
  reclamacao: 'reclamação',
}

function autenticado(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return !!process.env.CRON_LEMBRETES_SECRET && auth === `Bearer ${process.env.CRON_LEMBRETES_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  // Candidatos: conversas ativas ainda não escaladas hoje.
  const { data: conversas, error } = await supabase
    .from('crm_analise_conversa')
    .select('lead_id, score_atendente, perfil_lead, checklist_pct, estagio, escalonado_email_em, lead:leads_omnidesign(nome, telefone)')
    .not('estagio', 'in', '(fechado_ganho,fechado_perdido)')
    .or('escalonado_email_em.is.null,escalonado_email_em.lt.' + new Date().toISOString().slice(0, 10))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!conversas || conversas.length === 0) return NextResponse.json({ ok: true, escalados: 0 })

  const leadIds = conversas.map(c => c.lead_id)

  const { data: hits, error: hitsError } = await supabase
    .from('crm_analise_hits')
    .select('lead_id, falso_positivo, dicionario:crm_dicionario(categoria, subtipo)')
    .in('lead_id', leadIds)
    .eq('falso_positivo', false)

  if (hitsError) return NextResponse.json({ error: hitsError.message }, { status: 500 })

  const motivosPorLead = new Map<string, string[]>()
  for (const h of hits ?? []) {
    const dic = Array.isArray(h.dicionario) ? h.dicionario[0] : h.dicionario
    if (dic?.categoria !== 'escalonamento') continue
    const rotulo = ROTULOS_ESCALONAMENTO[dic.subtipo ?? ''] ?? dic.subtipo ?? 'padrão detectado'
    const lista = motivosPorLead.get(h.lead_id) ?? []
    if (!lista.includes(rotulo)) lista.push(rotulo)
    motivosPorLead.set(h.lead_id, lista)
  }

  let escalados = 0

  for (const c of conversas) {
    const motivos = [...(motivosPorLead.get(c.lead_id) ?? [])]
    if (c.score_atendente < 40) motivos.push('termômetro do atendente no vermelho')
    if (Number(c.checklist_pct) === 100 && c.perfil_lead === 'decidido' && c.estagio !== 'proposta_enviada') {
      motivos.push('checklist completo + perfil decidido — pronto pra proposta')
    }

    if (motivos.length === 0) continue

    const lead = Array.isArray(c.lead) ? c.lead[0] : c.lead
    const nome = lead?.nome ?? 'Lead sem nome'
    const telefone = lead?.telefone ?? '—'

    const html = `
      <p>O lead <strong>${nome}</strong> (${telefone}) precisa de atenção:</p>
      <ul>${motivos.map(m => `<li>${m}</li>`).join('')}</ul>
      <p>Veja o card completo no CRM interno.</p>
    `

    const resultado = await sendEmail({
      to: GESTOR_EMAIL,
      from: FROM,
      subject: `🔔 CRM — requer atenção: ${nome}`,
      html,
    })

    if (resultado.ok) {
      await supabase
        .from('crm_analise_conversa')
        .update({ escalonado_email_em: new Date().toISOString() })
        .eq('lead_id', c.lead_id)
      escalados++
    }
  }

  return NextResponse.json({ ok: true, escalados })
}
