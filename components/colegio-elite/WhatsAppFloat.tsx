'use client'

import { useState } from 'react'

export default function WhatsAppFloat({ whatsapp }: { whatsapp: string | null }) {
  const [pulsed, setPulsed] = useState(true)
  if (!whatsapp) return null
  const link = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20Colégio%20Elite`

  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-row-reverse items-center gap-3">
      <span className="wa-label hidden sm:block bg-[var(--ce-secondary)] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 translate-x-2 pointer-events-none">
        Fale conosco
      </span>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        onClick={() => setPulsed(false)}
        className="wa-btn relative w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        {pulsed && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] wa-pulse" aria-hidden="true" />
        )}
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 relative z-10">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.216l-.254-.152-3.097.919.86-3.137-.164-.26A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
        </svg>
      </a>
    </div>
  )
}
