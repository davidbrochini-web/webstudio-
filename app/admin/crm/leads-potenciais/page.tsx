import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LeadsPotenciaisHubPage() {
  const supabase = await createClient()
  const { count: total } = await supabase
    .from('leads_omnidesign')
    .select('id', { count: 'exact', head: true })
    .eq('origem', 'manual')
    .is('deleted_at', null)

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Leads potenciais</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Empresas que você quer contatar — prospecção manual, organizada aqui.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <Link
          href="/admin/crm/leads-potenciais/gerenciar"
          className="group bg-white border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
        >
          <span className="text-3xl">🗂️</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-4 mb-1">Gerenciar Leads</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Veja, atualize status, anote acompanhamento e envie PDFs dos {total ?? 0} leads já cadastrados.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:gap-2.5 transition-all">
            Abrir →
          </span>
        </Link>

        <Link
          href="/admin/crm/leads-potenciais/cadastrar"
          className="group bg-white border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
        >
          <span className="text-3xl">➕</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-4 mb-1">Cadastrar Leads</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Registre uma nova empresa pra contatar: dados de contato, segmento e documentos.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:gap-2.5 transition-all">
            Cadastrar →
          </span>
        </Link>
      </div>
    </div>
  )
}
