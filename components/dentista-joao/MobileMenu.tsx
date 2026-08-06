'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconLogin } from '@/components/dentista-joao/icons'

const BASE = '/projetos-especiais/dentista-joao'

interface Flags {
  tratamentos: boolean
  cursos: boolean
  equipe: boolean
  faq: boolean
  artigos: boolean
}

export default function MobileMenu({ flags }: { flags: Flags }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Seção marcada como oculta (VisibilidadeSecaoToggle no painel) some
  // do menu — mas continua existindo no banco, só não aparece no site.
  const NAV_ITEMS = [
    { label: 'Início',             href: BASE, show: true },
    { label: 'A Clínica',          href: `${BASE}/a-clinica`, show: true },
    { label: 'Tratamentos',        href: `${BASE}/tratamentos`, show: flags.tratamentos },
    { label: 'Cursos e Eventos',   href: `${BASE}/cursos-e-eventos`, show: flags.cursos },
    { label: 'Equipe',             href: `${BASE}/equipe`, show: flags.equipe },
    { label: 'Dúvidas Frequentes', href: `${BASE}/duvidas-frequentes`, show: flags.faq },
    { label: 'Artigos',            href: `${BASE}/artigos`, show: flags.artigos },
    { label: 'Contato',            href: `${BASE}/contato`, show: true },
  ].filter(item => item.show)

  return (
    <>
      {/* Hambúrguer */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="block w-5 h-0.5 bg-[#0B2B3C]" />
        <span className="block w-5 h-0.5 bg-[#0B2B3C]" />
        <span className="block w-5 h-0.5 bg-[#0B2B3C]" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <nav
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#0B2B3C]">
          <span className="font-display font-bold text-white">Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Itens do menu */}
        <div className="flex-1 overflow-y-auto py-4">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-6 py-3.5 text-sm font-medium border-l-4 transition-colors ${
                  active
                    ? 'border-[#0EA5A0] text-[#0B2B3C] bg-[#0EA5A0]/5'
                    : 'border-transparent text-slate-600 hover:text-[#0B2B3C] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* CTA no drawer */}
        <div className="p-5 border-t border-slate-100 flex flex-col gap-3">
          <Link
            href={`${BASE}/contato`}
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-[#0EA5A0] text-white font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Marcar Uma Consulta
          </Link>
          <Link
            href={`${BASE}/login`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium py-1 hover:text-[#0B2B3C] transition-colors"
          >
            <IconLogin className="w-3.5 h-3.5" />
            Login administrativo
          </Link>
        </div>
      </nav>
    </>
  )
}
