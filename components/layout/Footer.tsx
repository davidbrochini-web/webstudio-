import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-8 border-t border-[var(--brand)]/10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/omnidesign-icon.png"
            alt=""
            width={28}
            height={16}
            className="h-6 w-auto opacity-90"
          />
          <span className="font-display font-bold text-base text-white">omnidesign</span>
        </Link>
        <p className="text-xs text-white/30 text-center">
          © {new Date().getFullYear()} Omnidesign — Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}
