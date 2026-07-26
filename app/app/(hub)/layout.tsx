import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/auth/LogoutButton'

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <Image src="/brand/omnidesign-icon.png" alt="" width={26} height={15} className="h-6 w-auto" />
          <span className="font-display font-bold text-lg text-[var(--ink)]">omnidesign</span>
        </Link>
        <LogoutButton />
      </nav>
      <main className="px-6 py-10">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </>
  )
}
