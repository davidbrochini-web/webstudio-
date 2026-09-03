import Link from 'next/link'
import type { SiteEspecial } from '@/lib/localdesk'
import { formatTelefoneExibicao } from '@/lib/localdesk'

export default function Footer({ site, base }: { site: SiteEspecial; base: string }) {
  const ano = new Date().getFullYear()
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-panel)]">
      <div className="ld-container py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="ld-status-dot" />
            <span className="font-bold">{site.business_name}</span>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-xs">{site.tagline}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-3">Navegação</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href={`${base}/servicos`} className="text-[var(--ink)] hover:text-[var(--blue)]">Serviços</Link>
            <Link href={`${base}/sobre`} className="text-[var(--ink)] hover:text-[var(--blue)]">Sobre</Link>
            <Link href={`${base}/contato`} className="text-[var(--ink)] hover:text-[var(--blue)]">Contato</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)] mb-3">Contato</p>
          <div className="flex flex-col gap-2 text-sm text-[var(--ink)]">
            {site.telefone && <span>{formatTelefoneExibicao(site.telefone)}</span>}
            {site.endereco && <span className="text-[var(--muted)]">{site.endereco}</span>}
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="ld-container py-4 text-xs text-[var(--muted)]">
          © {ano} {site.business_name}
        </div>
      </div>
    </footer>
  )
}
