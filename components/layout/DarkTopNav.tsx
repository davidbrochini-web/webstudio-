'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export interface DarkNavItem {
  label: string
  href?: string
  children?: { label: string; href: string }[]
}

function NavDropdown({ item, active }: { item: DarkNavItem; active: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
          active ? 'text-[var(--brand2)]' : 'text-white/60 hover:text-white'
        }`}
      >
        {item.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && item.children && (
        <div className="absolute top-full left-0 mt-1 bg-[#111714] border border-white/10 rounded-xl shadow-xl py-1.5 min-w-[190px] z-50">
          {item.children.map(child => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const initials = email.slice(0, 2).toUpperCase()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--brand)] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {initials}
        </span>
        <span className="text-sm text-white/80 max-w-[160px] truncate">{email}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-[#111714] border border-white/10 rounded-xl shadow-xl py-1.5 min-w-[160px] z-50">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Navbar escura padrão do painel — usada tanto no /admin (super-admin)
 * quanto no /app (painel do cliente). Mesmo componente, itens
 * diferentes: decisão de produto de julho/2026 pra manter os dois
 * painéis com a MESMA identidade visual, em vez de dois estilos.
 *
 * `homeHref` decide pra onde o logo leva; `badge` é o texto pequeno ao
 * lado do logo ("admin" no painel interno, nome do tenant no painel
 * do cliente).
 */
export default function DarkTopNav({
  items,
  email,
  badge,
  homeHref,
}: {
  items: DarkNavItem[]
  email: string
  badge: string
  homeHref: string
}) {
  const pathname = usePathname()

  return (
    <nav className="bg-[#0B0F0C] border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8 min-w-0">
        <Link href={homeHref} className="flex items-center gap-2 flex-shrink-0">
          <Image src="/brand/omnidesign-icon.png" alt="" width={23} height={24} className="h-6 w-auto" />
          <span className="font-display font-bold text-lg text-white">omnidesign</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-white/30 border border-white/15 rounded-full px-2 py-0.5 ml-1 truncate max-w-[140px]">
              {badge}
            </span>
          )}
        </Link>
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {items.map(item => {
            if (item.children) {
              const active = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
              return <NavDropdown key={item.label} item={item} active={active} />
            }
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  active ? 'text-[var(--brand2)]' : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
                {active && <span className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-[var(--brand2)] rounded-full" />}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex-shrink-0">
        <UserMenu email={email} />
      </div>
    </nav>
  )
}
