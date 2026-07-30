import Link from 'next/link'
import type { SiteEspecial } from '@/lib/dentista-joao'

const BASE = '/projetos-especiais/dentista-joao'

const NAV_ITEMS = [
  { label: 'A Clínica',          href: `${BASE}/a-clinica` },
  { label: 'Tratamentos',        href: `${BASE}/tratamentos` },
  { label: 'Cursos e Eventos',   href: `${BASE}/cursos-e-eventos` },
  { label: 'Equipe',             href: `${BASE}/equipe` },
  { label: 'Contato',            href: `${BASE}/contato` },
]

export default function SiteNav({ site }: { site: SiteEspecial }) {
  const waLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=Olá%2C%20peguei%20esse%20contato%20no%20site`
    : null

  return (
    // header inteiro é sticky — barra superior + nav ficam juntos
    <header className="sticky top-0 z-40 shadow-sm">

      {/* Barra superior — link Dúvidas Frequentes + telefone/WhatsApp/redes */}
      <div className="bg-[#0EA5A0] text-white text-xs px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`${BASE}/duvidas-frequentes`}
          className="font-semibold uppercase tracking-wide hover:underline hidden sm:block"
        >
          Dúvidas Frequentes
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          {site.telefone && (
            <a href={`tel:${site.telefone.replace(/\D/g,'')}`} className="flex items-center gap-1 hover:opacity-80">
              📞 {site.telefone}
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-80">
              💬 WhatsApp
            </a>
          )}
          {site.instagram_handle && (
            <a
              href={`https://instagram.com/${site.instagram_handle.replace('@','')}`}
              target="_blank" rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              📸 Instagram
            </a>
          )}
        </div>
      </div>

      {/* Menu principal — branco, logo + itens + CTA */}
      <nav className="bg-white border-b border-slate-100 px-6 h-16 flex items-center justify-between">
        <Link href={BASE} className="font-display font-bold text-lg text-[#0B2B3C] flex-shrink-0">
          {site.business_name}
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 hover:text-[#0B2B3C] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href={`${BASE}/contato`}
          className="text-sm font-bold text-white bg-[#0B2B3C] px-5 py-2.5 rounded-full hover:bg-[#0EA5A0] transition-colors whitespace-nowrap"
        >
          Marcar Uma Consulta
        </Link>
      </nav>
    </header>
  )
}
