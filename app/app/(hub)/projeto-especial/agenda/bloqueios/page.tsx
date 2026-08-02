import { createClient } from '@/lib/supabase/server'
import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'
import AgendaSubNav from '@/components/app/AgendaSubNav'
import BloqueiosManager from '@/components/app/BloqueiosManager'

export default async function BloqueiosPage() {
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const supabase = await createClient()
  const { data: bloqueios } = await supabase
    .from('agendamento_bloqueios')
    .select('id, data, hora_inicio, hora_fim, motivo, created_at')
    .eq('site_id', info.siteId)
    .order('data', { ascending: false })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/projeto-especial" className="hover:text-[var(--ink)] transition-colors">Painel</Link>
        <span className="text-[var(--border)]">/</span>
        <Link href="/app/projeto-especial/agenda" className="hover:text-[var(--ink)] transition-colors">Agenda</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Bloqueios</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-1">Agenda</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Bloqueie datas em que a clínica não atende — feriados, congressos, férias.
      </p>

      <AgendaSubNav />
      <BloqueiosManager siteId={info.siteId} bloqueios={bloqueios ?? []} />
    </div>
  )
}
