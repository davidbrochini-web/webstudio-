import Link from 'next/link'

export default function ImpersonationBanner({ tenantNome }: { tenantNome: string }) {
  return (
    <div className="bg-amber-400 text-black text-sm font-semibold px-4 py-2 flex items-center justify-center gap-3 sticky top-0 z-50">
      <span>👁️ Visualizando como: {tenantNome}</span>
      <Link href="/admin/impersonar/sair" className="underline hover:no-underline">
        Voltar pro admin
      </Link>
    </div>
  )
}
