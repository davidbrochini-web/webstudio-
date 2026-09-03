'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header({ base, cta }: { base: string; cta: { href: string; label: string; externo: boolean } }) {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  const links = [
    { label: 'Serviços', href: `${base}/servicos` },
    { label: 'Como funciona', href: `${base}#como-funciona` },
    { label: 'Sobre', href: `${base}/sobre` },
    { label: 'Dúvidas', href: `${base}#faq` },
  ]

  const ctaProps = cta.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-panel)]/90 backdrop-blur border-b border-[var(--line)]">
      <div className="ld-container flex items-center justify-between h-16">
        <Link href={base || '/'} className="flex items-center gap-2">
          <span className="ld-status-dot" />
          <span className="font-bold text-lg">LocalDesk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? 'text-[var(--blue)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={cta.href}
            {...ctaProps}
            className="cursor-pointer hidden sm:inline-flex items-center gap-2 text-sm font-bold text-white bg-[var(--green)] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            {cta.label}
          </a>
          <button
            onClick={() => setAberto(o => !o)}
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            className="cursor-pointer md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[var(--ink)]"
          >
            {aberto ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            )}
          </button>
        </div>
      </div>

      {aberto && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--bg-panel)]">
          <div className="ld-container flex flex-col py-2">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setAberto(false)} className="py-3 text-[15px] font-medium text-[var(--ink)]">
                {l.label}
              </Link>
            ))}
            <a href={cta.href} {...ctaProps} className="cursor-pointer mt-2 mb-3 inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-[var(--green)] px-4 py-3 rounded-full">
              {cta.label}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
