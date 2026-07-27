import Link from 'next/link'
import type { SiteEspecial } from '@/lib/dentista-joao'

const NAV_ITEMS = [
  { label: 'Início', href: '/projetos-especiais/dentista-joao' },
  { label: 'A Clínica', href: '/projetos-especiais/dentista-joao/a-clinica' },
  { label: 'Tratamentos', href: '/projetos-especiais/dentista-joao/tratamentos' },
  { label: 'Cursos e Eventos', href: '/projetos-especiais/dentista-joao/cursos-e-eventos' },
  { label: 'Equipe', href: '/projetos-especiais/dentista-joao/equipe' },
  { label: 'Dúvidas Frequentes', href: '/projetos-especiais/dentista-joao/duvidas-frequentes' },
  { label: 'Artigos', href: '/projetos-especiais/dentista-joao/artigos' },
]

export default function SiteNav({ site }: { site: SiteEspecial }) {
  const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null

  return (
    <header>
      {/* Barra superior — telefone/WhatsApp/redes, igual ao site de referência */}
      <div className="bg-[#0B2B3C] text-white/80 text-xs px-6 py-2 flex flex-wrap items-center justify-center sm:justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {site.telefone && <span>📞 {site.telefone}</span>}
          {waLink && <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">💬 WhatsApp</a>}
        </div>
        {site.instagram_handle && (
          <a
            href={`https://instagram.com/${site.instagram_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            @{site.instagram_handle.replace('@', '')}
          </a>
        )}
      </div>

      {/* Menu principal */}
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link href="/projetos-especiais/dentista-joao" className="font-display font-bold text-lg text-[#0B2B3C]">
          {site.business_name}
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.slice(1).map(item => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 hover:text-[#0B2B3C] transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/projetos-especiais/dentista-joao/contato"
          className="text-sm font-bold text-white bg-[#0EA5A0] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Marcar consulta
        </Link>
      </nav>
    </header>
  )
}
