import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--off)]">
      <nav className="bg-[var(--card-bg)] border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-display font-extrabold text-lg grad-text">webstudio</span>
          <div className="hidden sm:flex items-center gap-1">
            <Link href="/admin" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] px-3 py-2 rounded-lg hover:bg-[var(--off)] transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/tenants" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] px-3 py-2 rounded-lg hover:bg-[var(--off)] transition-colors">
              Tenants
            </Link>
          </div>
        </div>
        <LogoutButton />
      </nav>
      <main className="px-6 py-10">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
