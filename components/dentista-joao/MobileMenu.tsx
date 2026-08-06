'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconLogin } from '@/components/dentista-joao/icons'

interface Flags {
  tratamentos: boolean
  cursos: boolean
  equipe: boolean
  faq: boolean
  artigos: boolean
}

export default function MobileMenu({ flags, base }: { flags: Flags; base: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Seção marcada como oculta (VisibilidadeSecaoToggle no painel) some
  // do menu — mas continua existindo no banco, só não aparece no site.
  // `match` é sempre relativo (sem o prefixo interno) — usado só pra
  // destacar o item ativo, funciona independente de `usePathname()`
  // devolver o path interno ou o externo (o rewrite do proxy.ts se
  // comporta diferente dependendo da versão/config do Next).
  const NAV_ITEMS = [
    { label: 'Início',             href: base || '/', match: '/', show: true },
    { label: 'A Clínica',          href: `${base}/a-clinica`, match: '/a-clinica', show: true },
    { label: 'Tratamentos',        href: `${base}/tratamentos`, match: '/tratamentos', show: flags.tratamentos },
    { label: 'Cursos e Eventos',   href: `${base}/cursos-e-eventos`, match: '/cursos-e-eventos', show: flags.cursos },
    { label: 'Equipe',             href: `${base}/equipe`, match: '/equipe', show: flags.equipe },
    { label: 'Dúvidas Frequentes', href: `${base}/duvidas-frequentes`, match: '/duvidas-frequentes', show: flags.faq },
    { label: 'Artigos',            href: `${base}/artigos`, match: '/artigos', show: flags.artigos },
    { label: 'Contato',            href: `${base}/contato`, match: '/contato', show: true },
  ].filter(item => item.show)

  return (
    <>
      {/* Hambúrguer */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="block w-5 h-0.5 bg-[var(--dj-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--dj-secondary)]" />
        <span className="block w-5 h-0.5 bg-[var(--dj-secondary)]" />
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[var(--dj-secondary)]">
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
            // Normaliza o pathname atual removendo o prefixo interno (se vier
            // assim) antes de comparar — funciona tanto no domínio próprio
            // (pathname já limpo) quanto no fallback .vercel.app (pathname
            // com o prefixo completo).
            const currentPath = (pathname || '/').replace('/projetos-especiais/dentista-joao', '') || '/'
            const active = currentPath === item.match
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-6 py-3.5 text-sm font-medium border-l-4 transition-colors ${
                  active
                    ? 'border-[var(--dj-primary)] text-[var(--dj-secondary)] bg-[var(--dj-primary)]/5'
                    : 'border-transparent text-slate-600 hover:text-[var(--dj-secondary)] hover:bg-slate-50'
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
            href={`${base}/contato`}
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-[var(--dj-primary)] text-white font-bold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Marcar Uma Consulta
          </Link>
          <Link
            href={`${base}/login`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium py-1 hover:text-[var(--dj-secondary)] transition-colors"
          >
            <IconLogin className="w-3.5 h-3.5" />
            Login administrativo
          </Link>
        </div>
      </nav>
    </>
  )
}
