import Link from 'next/link'

export default function Footer({ base }: { base: string }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <span className="brand">Casos<span>•</span>Esquecidos</span>
        <nav className="footer-links" aria-label="Links do rodapé">
          <a href="https://www.amazon.com.br/dp/B0F6D1LXSV" target="_blank" rel="noopener">Amazon</a>
          <a href="https://www.instagram.com/db.casosesquecidos/" target="_blank" rel="noopener">Instagram</a>
          <Link href={`${base}/contos`}>Contos</Link>
          <Link href={`${base}/sobre`}>O Autor</Link>
          <Link href={`${base}/#apoio`}>Pix</Link>
          <Link href="/login">Login</Link>
        </nav>
        <span className="footer-note">© {new Date().getFullYear()} D. Broch — todos os direitos reservados</span>
      </div>
    </footer>
  )
}
