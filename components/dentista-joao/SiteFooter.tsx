import type { SiteEspecial } from '@/lib/dentista-joao'
import NewsletterForm from '@/components/dentista-joao/NewsletterForm'

const LINKS = [
  { label: 'A Clínica', href: '/projetos-especiais/dentista-joao/a-clinica' },
  { label: 'Tratamentos', href: '/projetos-especiais/dentista-joao/tratamentos' },
  { label: 'Equipe', href: '/projetos-especiais/dentista-joao/equipe' },
  { label: 'Dúvidas Frequentes', href: '/projetos-especiais/dentista-joao/duvidas-frequentes' },
  { label: 'Contato', href: '/projetos-especiais/dentista-joao/contato' },
]

export default function SiteFooter({ site }: { site: SiteEspecial }) {
  const waLink = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null

  return (
    <footer className="bg-[#0B2B3C] text-white/60 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Coluna 1 — identidade + contato */}
        <div>
          <p className="font-display font-bold text-white text-lg mb-3">{site.business_name}</p>
          <p className="mb-4 leading-relaxed">{site.tagline}</p>
          <ul className="flex flex-col gap-1.5">
            {site.telefone && <li>📞 {site.telefone}</li>}
            {waLink && <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">💬 {site.whatsapp}</a></li>}
            {site.endereco && <li>📍 {site.endereco}</li>}
          </ul>
        </div>

        {/* Coluna 2 — links + redes sociais */}
        <div>
          <p className="font-display font-bold text-white mb-3">Links</p>
          <ul className="flex flex-col gap-1.5 mb-6">
            {LINKS.map(l => (
              <li key={l.href}><a href={l.href} className="hover:text-white">{l.label}</a></li>
            ))}
          </ul>
          {site.instagram_handle && (
            <>
              <p className="font-display font-bold text-white mb-3">Redes Sociais</p>
              <a
                href={`https://instagram.com/${site.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Instagram
              </a>
            </>
          )}
        </div>

        {/* Coluna 3 — newsletter (só captura o contato; disparo de
            e-mail automático continua fora de escopo) */}
        <div>
          <p className="font-display font-bold text-white mb-3">News</p>
          <p className="mb-4">Inscreva-se pra receber nossos informativos.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {site.business_name}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
