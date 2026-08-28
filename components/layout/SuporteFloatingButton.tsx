'use client'

export default function SuporteFloatingButton() {
  return (
    <button
      aria-label="Suporte"
      className="cursor-pointer fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-105"
      style={{ background: 'var(--brand2, #0EA5A0)' }}
    >
      🎧
    </button>
  )
}
