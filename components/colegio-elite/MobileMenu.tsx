'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconLogin } from '@/components/colegio-elite/icons'
import { texto, type TextosCustomizados } from '@/lib/textos-customizados'

interface Flags {
  diferenciais: boolean
  segmentos: boolean
  faq: boolean
  artigos: boolean
}

export default function MobileMenu({ flags, base, textos }: { flags: Flags; base: string; textos?: TextosCustomizados | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const NAV_ITEMS = [
    { label: 'Início',                                              href: base || '/', match: '/', show: true },
    { label: texto(textos, 'nav_proposta', 'Proposta Pedagógica'),   href: `${base}/proposta-pedagogica`, match: '/proposta-pedagogica', show: true },
    { label: texto(textos, 'nav_ensino', 'Ensino'),                  href: `${base}/ensino`, match: '/ensino', show: flags.segmentos },
    { label: texto(textos, 'nav_estrutura', 'Estrutura'),            href: `${base}/estrutura`, match: '/estrutura', show: flags.diferenciais },
    { label: texto(textos, 'nav_noticias', 'Notícias'),              href: `${base}/noticias`, match: '/noticias', show: flags.artigos },
    { label: texto(textos, 'nav_localizacao', 'Localização'),        href: `${base}/localizacao`, match: '/localizacao', show: true },
    { label: texto(textos, 'nav_contato', 'Contato'),                href: `${base}/contato`, match: '/contato', show: true },
  ].filter(item => item.show)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="block w-5 h-0.5 bg-[var(--ce-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--ce-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--ce-secondary)]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[var(--ce-secondary)]">
          <span className="font-display font-bold text-white">Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map(item => {
            const currentPath = (pathname || '/').replace('/projetos-especiais/colegio-elite', '') || '/'
            const active = currentPath === item.match
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-6 py-3.5 text-sm font-medium border-l-4 transition-colors ${
                  active
                    ? 'border-[var(--ce-primary)] text-[var(--ce-secondary)] bg-[var(--ce-primary)]/5'
                    : 'border-transparent text-slate-600 hover:text-[var(--ce-secondary)] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-5 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href={`${base}/contato`}
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-[var(--ce-primary)] text-white font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            {texto(textos, 'nav_cta', 'Fale Conosco')}
          </Link>
          <Link
            href={`${base}/login`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium py-1 hover:text-[var(--ce-secondary)] transition-colors"
          >
            <IconLogin className="w-3.5 h-3.5" />
            Login administrativo
          </Link>
        </div>
      </nav>
    </>
  )
}
