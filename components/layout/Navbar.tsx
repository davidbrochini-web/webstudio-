'use client'

import { useState } from 'react'
import Link from 'next/link'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-extrabold text-xl grad-text">
          webstudio
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {[
            { href: '#demo',          label: 'Demo' },
            { href: '#templates',     label: 'Modelos de site' },
            { href: '#modulos',       label: 'Sistemas' },
            { href: '#preco',         label: 'Preço' },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-medium text-[var(--muted)] hover:text-[var(--slate)] transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#22c55e] transition-all hover:-translate-y-px"
        >
          💬 WhatsApp
        </a>

        {/* Mobile: WA button + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold"
          >
            💬 WhatsApp
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--off)] transition-colors"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-white px-6 pb-4">
          {[
            { href: '#demo',          label: 'Demo' },
            { href: '#templates',     label: 'Modelos de site' },
            { href: '#modulos',       label: 'Sistemas' },
            { href: '#preco',         label: 'Preço' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-[var(--slate)] border-b border-[var(--border)] last:border-0"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
