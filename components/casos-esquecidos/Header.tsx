import Link from 'next/link'

const BASE = '/projetos-especiais/casos-esquecidos'

export default function Header() {
  return (
    <>
      <div className="announce-bar">
        <Link href={`${BASE}/contos`}>📖 Novos contos de terror toda semana — <strong>grátis para ler</strong> →</Link>
      </div>
      <header className="site-header">
        <div className="container">
          <Link href={BASE} className="brand">Casos<span>•</span>Esquecidos</Link>
          <nav className="site-nav" aria-label="Menu principal">
            <Link href={`${BASE}/contos`}>Contos</Link>
            <Link href={`${BASE}#livro`}>O Livro</Link>
            <Link href={`${BASE}#apoio`}>Apoiar</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>
    </>
  )
}
