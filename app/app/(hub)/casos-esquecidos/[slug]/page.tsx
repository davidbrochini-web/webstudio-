import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentTenant } from '@/lib/current-tenant'
import { getContoBySlugAdmin } from '@/lib/casos-esquecidos'
import ContoForm from '@/components/casos-esquecidos-admin/ContoForm'
import { atualizarConto } from '@/app/app/(hub)/casos-esquecidos/actions'

export default async function EditarContoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const info = await getCurrentTenant()
  if (!info || !info.siteId) return null

  const conto = await getContoBySlugAdmin(info.siteId, slug)
  if (!conto) notFound()

  // Adapta a assinatura genérica do ContoForm — action(siteId, formData) —
  // fechando sobre o id do conto que está sendo editado.
  async function acaoAdaptada(siteId: string, formData: FormData) {
    'use server'
    return atualizarConto(siteId, conto!.id, formData)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8">
        <Link href="/app/casos-esquecidos" className="hover:text-[var(--ink)] transition-colors">Casos Esquecidos</Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--ink)] font-medium">Nº {String(conto.numero).padStart(3, '0')} — {conto.titulo}</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] mb-6">Editar caso</h1>

      <ContoForm siteId={info.siteId} conto={conto} action={acaoAdaptada} />
    </div>
  )
}
