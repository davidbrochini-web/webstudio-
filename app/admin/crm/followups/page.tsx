import Link from 'next/link'
import { getFilaFollowup, getTemplatesFollowup } from '@/app/admin/crm/inteligencia-actions'
import FilaFollowupList from '@/components/admin/FilaFollowupList'
import TemplatesFollowupPanel from '@/components/admin/TemplatesFollowupPanel'

export default async function FollowupsPage() {
  const [fila, templates] = await Promise.all([getFilaFollowup(), getTemplatesFollowup()])

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/crm/leads-potenciais" className="hover:text-[var(--ink)] transition-colors">Leads potenciais</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Follow-ups de hoje</span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Follow-ups de hoje</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Envio continua manual — copie o texto e mande pelo WhatsApp de verdade. Marcar como enviado tira o lead
        da fila até ele responder de novo ou passar pro próximo prazo.
      </p>

      <FilaFollowupList itens={fila} />

      <div className="mt-10 pt-8 border-t border-[var(--border)]">
        <TemplatesFollowupPanel templatesIniciais={templates} />
      </div>
    </div>
  )
}
