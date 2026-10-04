export default function ImpersonationBanner({ tenantNome }: { tenantNome: string }) {
  return (
    <div className="print:hidden bg-amber-400 text-black text-sm font-semibold px-4 py-2 flex items-center justify-center gap-3 sticky top-0 z-50">
      <span>👁️ Visualizando como: {tenantNome}</span>
      {/* <a> e não <Link>: o Link faz prefetch da rota de "sair" assim que
          o banner aparece, e o prefetch executava a rota e apagava o
          cookie da impersonação (ver lib/route-prefetch.ts). */}
      <a href="/admin/impersonar/sair" className="underline hover:no-underline">
        Voltar pro admin
      </a>
    </div>
  )
}
