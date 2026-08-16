export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--off)]">
      {children}
    </div>
  )
}
