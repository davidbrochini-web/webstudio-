import Link from 'next/link'

const BASE = '/projetos-especiais/casos-esquecidos'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span className="brand">Casos<span>•</span>Esquecidos</span>
        <nav className="footer-links" aria-label="Links do rodapé">
          <a href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Amazon</a>
          <a href="https://www.instagram.com/db.casosesquecidos/" target="_blank" rel="noopener">Instagram</a>
          <Link href={`${BASE}/contos`}>Contos</Link>
          <Link href={`${BASE}/sobre`}>O Autor</Link>
          <Link href={`${BASE}#apoio`}>Pix</Link>
        </nav>
        <span className="footer-note">© {new Date().getFullYear()} D. Broch — todos os direitos reservados</span>
      </div>
    </footer>
  )
}
