'use client'

export default function ImprimirBotao() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
    >
      🖨️ Imprimir / salvar PDF
    </button>
  )
}
