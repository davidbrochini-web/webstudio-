import Link from 'next/link'
import type { SiteEspecial } from '@/lib/colegio-elite'
import MobileMenu from '@/components/colegio-elite/MobileMenu'
import { IconPhone, IconWhatsApp, IconInstagram, IconLogin } from '@/components/colegio-elite/icons'
import { texto } from '@/lib/textos-customizados'

export default function SiteNav({ site, base }: { site: SiteEspecial; base: string }) {
  const waLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20Col%C3%A9gio%20Elite`
    : null

  const flags = {
    diferenciais: site.secao_diferenciais_visivel,
    segmentos: site.secao_segmentos_visivel,
    faq: site.secao_faq_visivel,
    artigos: site.secao_artigos_visivel,
  }
  const t = site.textos_customizados
  const NAV_ITEMS = [
    { label: texto(t, 'nav_proposta', 'Proposta Pedagógica'), href: `${base}/proposta-pedagogica`, show: true },
    { label: texto(t, 'nav_ensino', 'Ensino'),                href: `${base}/ensino`, show: flags.segmentos },
    { label: texto(t, 'nav_estrutura', 'Estrutura'),          href: `${base}/estrutura`, show: flags.diferenciais },
    { label: texto(t, 'nav_noticias', 'Notícias'),            href: `${base}/noticias`, show: flags.artigos },
    { label: texto(t, 'nav_localizacao', 'Localização'),      href: `${base}/localizacao`, show: true },
    { label: texto(t, 'nav_contato', 'Contato'),               href: `${base}/contato`, show: true },
  ].filter(item => item.show)

  const centralizado = site.logo_posicao === 'centro'
  const meio = Math.ceil(NAV_ITEMS.length / 2)
  const itensEsquerda = centralizado ? NAV_ITEMS.slice(0, meio) : NAV_ITEMS
  const itensDireita = centralizado ? NAV_ITEMS.slice(meio) : []

  const linkClass = 'nav-underline text-sm font-medium text-slate-600 hover:text-[var(--ce-secondary)] transition-colors whitespace-nowrap'

  const logo = site.logo_url ? (
    <div className="w-[68px] h-[68px] sm:w-[104px] sm:h-[104px] bg-white rounded-2xl p-1.5 shadow-xl border-2 border-[var(--ce-primary)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.logo_url} alt={site.business_name} className="w-full h-full object-cover rounded-xl" />
    </div>
  ) : (
    <span className="font-display font-bold text-base sm:text-lg text-[var(--ce-secondary)] whitespace-nowrap">
      {site.business_name}
    </span>
  )

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-[var(--ce-primary)] text-white text-xs px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
        {flags.faq && (
          <Link
            href={`${base}/proposta-pedagogica`}
            className="font-semibold uppercase tracking-wide hover:underline hidden sm:block"
          >
            {texto(t, 'nav_proposta', 'Proposta Pedagógica')}
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

      <nav className="relative bg-white border-b border-slate-100 px-4 sm:px-6 h-16 sm:h-20 flex items-center gap-4">
        {centralizado ? (
          <>
            <div className="flex items-center gap-3 flex-shrink-0 invisible" aria-hidden="true">
              <span className="hidden sm:inline-block text-sm font-bold px-4 py-2.5 rounded-full whitespace-nowrap">
                {texto(t, 'nav_cta', 'Fale Conosco')}
              </span>
              <span className="lg:hidden flex flex-col gap-1.5 p-2">
                <span className="block w-5 h-0.5" />
                <span className="block w-5 h-0.5" />
                <span className="block w-5 h-0.5" />
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-5 xl:gap-7 h-full">
              <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                {itensEsquerda.map(item => (
                  <Link key={item.href} href={item.href} className={linkClass}>{item.label}</Link>
                ))}
              </div>

              <div className="relative w-14 sm:w-20 lg:w-28 h-full flex-shrink-0" aria-hidden="true">
                <Link href={base || '/'} className="absolute left-1/2 -translate-x-1/2 top-2.5 sm:top-3 z-10">
                  {logo}
                </Link>
              </div>

              <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                {itensDireita.map(item => (
                  <Link key={item.href} href={item.href} className={linkClass}>{item.label}</Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 sm:w-28 flex-shrink-0" aria-hidden="true" />
            <Link href={base || '/'} className="absolute left-4 sm:left-6 top-2.5 sm:top-3 z-10">
              {logo}
            </Link>
            <div className="hidden lg:flex flex-1 items-center gap-5 xl:gap-7">
              {NAV_ITEMS.map(item => (
                <Link key={item.href} href={item.href} className={linkClass}>{item.label}</Link>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`${base}/contato`}
            className="hidden sm:inline-block text-sm font-bold text-white bg-[var(--ce-secondary)] px-4 py-2.5 rounded-full hover:bg-[var(--ce-primary)] transition-colors whitespace-nowrap"
          >
            {texto(t, 'nav_cta', 'Fale Conosco')}
          </Link>
          <MobileMenu flags={flags} base={base} textos={t} />
        </div>
      </nav>
    </header>
  )
}
