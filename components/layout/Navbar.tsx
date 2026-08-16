'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

const WA_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}`

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F0C]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/omnidesign-icon.png"
            alt=""
            width={30}
            height={32}
            className="h-7 w-auto"
            priority
          />
          <span className="font-display font-bold text-lg tracking-tight text-white">
            omnidesign
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {[
            { href: '#instagram',     label: 'Instagram' },
            { href: '#templates',     label: 'Modelos de site' },
            { href: '#marketing-digital', label: 'Marketing' },
            { href: '/blog',          label: 'Blog' },
            { href: '#modulos',       label: 'Sistemas' },
            { href: '#preco',         label: 'Valores' },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/#contato"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg grad-bg text-white text-sm font-semibold hover:opacity-90 transition-all hover:-translate-y-px"
        >
          ✨ Peça uma demo
        </Link>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#22c55e] transition-all hover:-translate-y-px"
        >
          💬 WhatsApp
        </a>
        </div>

        {/* Mobile: theme toggle + WA button + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
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
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
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
        <div className="md:hidden border-t border-white/10 bg-[#0B0F0C] px-6 pb-4">
          <Link
            href="/#contato"
            onClick={() => setOpen(false)}
            className="block py-3 text-sm font-semibold text-[var(--brand2)] border-b border-white/10"
          >
            ✨ Peça uma demo
          </Link>
          {[
            { href: '#instagram',     label: 'Instagram' },
            { href: '#templates',     label: 'Modelos de site' },
            { href: '#marketing-digital', label: 'Marketing' },
            { href: '/blog',          label: 'Blog' },
            { href: '#modulos',       label: 'Sistemas' },
            { href: '#preco',         label: 'Valores' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-white/70 border-b border-white/10 last:border-0"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
