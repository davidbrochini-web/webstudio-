import type { SiteEspecial } from '@/lib/dentista-joao'

export default function SiteFooter({ site }: { site: SiteEspecial }) {
  return (
    <footer className="bg-[#0B2B3C] text-white/60 text-sm px-6 py-10 mt-20">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display font-bold text-white mb-1">{site.business_name}</p>
          {site.endereco && <p>{site.endereco}</p>}
          {site.telefone && <p>{site.telefone}</p>}
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} {site.business_name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
