import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111827] px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-display font-extrabold text-lg grad-text">
          webstudio
        </Link>
        <p className="text-xs text-white/30 text-center">
          © {new Date().getFullYear()} webstudio — Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}
