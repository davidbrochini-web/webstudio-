import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LeadsPotenciaisHubPage() {
  const supabase = await createClient()
  const { count: total } = await supabase
    .from('leads_omnidesign')
    .select('id', { count: 'exact', head: true })
    .eq('origem', 'manual')
    .is('deleted_at', null)

  const { count: pendentes } = await supabase
    .from('crm_simulador_auditorias')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pendente')

  return (
    <div>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-1">Leads potenciais</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Empresas que você quer contatar — prospecção manual, organizada aqui.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <Link
          href="/admin/crm/leads-potenciais/gerenciar"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
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
          href="/admin/crm/followups"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
        >
          <span className="text-3xl">⏰</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-4 mb-1">Follow-ups de hoje</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Leads que estão esperando resposta há um tempo — fila calculada automaticamente.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:gap-2.5 transition-all">
            Abrir →
          </span>
        </Link>

        <Link
          href="/admin/crm/dicionario"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
        >
          <span className="text-3xl">🧠</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-4 mb-1">Cérebro do CRM</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Padrões que o motor reconhece nas conversas — adicione variações, corrija falsos positivos, teste frases.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:gap-2.5 transition-all">
            Abrir →
          </span>
        </Link>

        <Link
          href="/admin/crm/leads-potenciais/cadastrar"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all"
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

        <Link
          href="/admin/crm/auditorias-simulador"
          className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--brand)] hover:shadow-lg hover:shadow-green-50 transition-all relative"
        >
          {(pendentes ?? 0) > 0 && (
            <span className="absolute top-5 right-5 text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">
              {pendentes} pendente{pendentes === 1 ? '' : 's'}
            </span>
          )}
          <span className="text-3xl">🔍</span>
          <h2 className="font-display font-bold text-lg text-[var(--ink)] mt-4 mb-1">Auditorias do Simulador</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            Problemas reportados no cliente automático durante o treino — com a conversa inteira salva pra revisar.
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] group-hover:gap-2.5 transition-all">
            Abrir →
          </span>
        </Link>
      </div>
    </div>
  )
}
