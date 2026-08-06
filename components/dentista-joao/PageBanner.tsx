import Link from 'next/link'

const BASE = '/projetos-especiais/dentista-joao'

/**
 * Banner das inner pages com breadcrumb (Home › [páginas] › atual).
 * `crumbs` são os níveis intermediários opcionais (ex: página de
 * detalhe de tratamento passa [{label:'Tratamentos', href:...}]).
 */
export default function PageBanner({
  title,
  imageUrl,
  crumbs = [],
}: {
  title: string
  imageUrl?: string | null
  crumbs?: { label: string; href: string }[]
}) {
  return (
    <section className="relative px-5 sm:px-6 py-16 sm:py-24 text-center overflow-hidden">
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--dj-secondary)]/85 to-[var(--dj-secondary)]/75" />
      <div className="relative hero-text-enter">
        <nav aria-label="breadcrumb" className="mb-3 text-xs sm:text-sm text-white/70">
          <Link href={BASE} className="hover:text-white transition-colors">Home</Link>
          {crumbs.map(c => (
            <span key={c.href}>
              <span className="mx-2">›</span>
              <Link href={c.href} className="hover:text-white transition-colors">{c.label}</Link>
            </span>
          ))}
          <span className="mx-2">›</span>
          <span className="text-white">{title}</span>
        </nav>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">{title}</h1>
        <div className="mt-4 mx-auto h-1 w-16 rounded-full bg-[var(--dj-primary)]" />
      </div>
    </section>
  )
}
