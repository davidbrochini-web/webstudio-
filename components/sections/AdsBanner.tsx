import Link from 'next/link'

export default function AdsBanner() {
  return (
    <div className="grad-bg">
      <Link
        href="#marketing-digital"
        className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-center gap-2 text-center group"
      >
        <span className="hidden sm:inline text-white/90 text-xs font-bold tracking-widest uppercase">
          Novidade
        </span>
        <span className="hidden sm:inline text-white/50">·</span>
        <span className="text-white text-sm font-medium">
          Agora também cuidamos de Google Ads, ChatGPT Ads e do seu Google Meu Negócio
        </span>
        <span className="text-white text-sm font-bold group-hover:translate-x-0.5 transition-transform">
          Ver como →
        </span>
      </Link>
    </div>
  )
}
