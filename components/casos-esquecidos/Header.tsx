import Link from 'next/link'

export default function Header({ base }: { base: string }) {
  return (
    <>
      <div className="announce-bar">
        <Link href={`${base}/contos`}>📖 Novos contos de terror toda semana — <strong>grátis para ler</strong> →</Link>
      </div>
      <header className="site-header">
        <div className="container">
          <Link href={base || '/'} className="brand">Casos<span>•</span>Esquecidos</Link>
          <nav className="site-nav" aria-label="Menu principal">
            <Link href={`${base}/contos`}>Contos</Link>
            <Link href={`${base}/#livro`}>O Livro</Link>
            <Link href={`${base}/#apoio`}>Apoiar</Link>
          </nav>
        </div>
      </header>
    </>
  )
}
