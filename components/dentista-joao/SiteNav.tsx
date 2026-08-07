import Link from 'next/link'
import type { SiteEspecial } from '@/lib/dentista-joao'
import MobileMenu from '@/components/dentista-joao/MobileMenu'
import { IconPhone, IconWhatsApp, IconInstagram, IconLogin } from '@/components/dentista-joao/icons'
import { texto } from '@/lib/textos-customizados'

export default function SiteNav({ site, base }: { site: SiteEspecial; base: string }) {
  const waLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=Olá%2C%20peguei%20esse%20contato%20no%20site`
    : null

  // Seção marcada como oculta no painel (VisibilidadeSecaoToggle) some
  // do menu — continua existindo no banco, só não aparece pro visitante.
  const flags = {
    tratamentos: site.secao_tratamentos_visivel,
    cursos: site.secao_cursos_visivel,
    equipe: site.secao_equipe_visivel,
    faq: site.secao_faq_visivel,
    artigos: site.secao_artigos_visivel,
  }
  const t = site.textos_customizados
  const NAV_ITEMS = [
    { label: texto(t, 'nav_a_clinica', 'A Clínica'),          href: `${base}/a-clinica`, show: true },
    { label: texto(t, 'nav_tratamentos', 'Tratamentos'),        href: `${base}/tratamentos`, show: flags.tratamentos },
    { label: texto(t, 'nav_cursos', 'Cursos e Eventos'),   href: `${base}/cursos-e-eventos`, show: flags.cursos },
    { label: texto(t, 'nav_equipe', 'Equipe'),             href: `${base}/equipe`, show: flags.equipe },
    { label: texto(t, 'nav_faq', 'Dúvidas Frequentes'), href: `${base}/duvidas-frequentes`, show: flags.faq },
    { label: texto(t, 'nav_artigos', 'Artigos'),            href: `${base}/artigos`, show: flags.artigos },
    { label: texto(t, 'nav_contato', 'Contato'),           href: `${base}/contato`, show: true },
  ].filter(item => item.show)

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Barra superior — compacta no mobile, completa no desktop */}
      <div className="bg-[var(--dj-primary)] text-white text-xs px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
        {flags.faq && (
          <Link
            href={`${base}/duvidas-frequentes`}
            className="font-semibold uppercase tracking-wide hover:underline hidden sm:block"
          >
            {texto(t, 'nav_faq', 'Dúvidas Frequentes')}
          </Link>
        )}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap ml-auto">
          {site.telefone && (
            <a href={`tel:${site.telefone.replace(/\D/g,'')}`} className="hover:opacity-80 flex items-center gap-1.5">
              <IconPhone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{site.telefone}</span>
              <span className="sm:hidden">Ligar</span>
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 flex items-center gap-1.5">
              <IconWhatsApp className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          {site.instagram_visivel && site.instagram_handle && (
            <a
              href={`https://instagram.com/${site.instagram_handle.replace('@','')}`}
              target="_blank" rel="noopener noreferrer"
              className="hover:opacity-80 flex items-center gap-1.5"
            >
              <IconInstagram className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instagram</span>
            </a>
          )}
          <Link href={`${base}/login`} className="hover:opacity-80 flex items-center gap-1.5 border-l border-white/25 pl-3 sm:pl-5">
            <IconLogin className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
        </div>
      </div>

      {/* Menu principal — barra um pouco mais alta que o padrão pra
          acomodar logo quadrado/emblema sem espremer os detalhes */}
      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between gap-4">
        <Link href={base || '/'} className="flex-shrink-0 flex items-center max-w-[160px] sm:max-w-none">
          {site.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo_url} alt={site.business_name} className="h-14 sm:h-[4.5rem] w-auto object-contain" />
          ) : (
            <span className="font-display font-bold text-base sm:text-lg text-[var(--dj-secondary)] truncate">
              {site.business_name}
            </span>
          )}
        </Link>

        {/* Itens desktop */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-underline text-sm font-medium text-slate-600 hover:text-[var(--dj-secondary)] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* CTA — oculto no mobile pequeno pra não colidir com logo */}
          <Link
            href={`${base}/contato`}
            className="hidden sm:inline-block text-sm font-bold text-white bg-[var(--dj-secondary)] px-4 py-2.5 rounded-full hover:bg-[var(--dj-primary)] transition-colors whitespace-nowrap"
          >
            {texto(t, 'nav_cta', 'Marcar consulta')}
          </Link>
          {/* Hambúrguer — só aparece quando o menu de itens está oculto */}
          <MobileMenu flags={flags} base={base} textos={t} />
        </div>
      </nav>
    </header>
  )
}
