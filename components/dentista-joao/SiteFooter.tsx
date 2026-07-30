import type { SiteEspecial } from '@/lib/dentista-joao'
import { formatTelefoneExibicao } from '@/lib/dentista-joao'
import NewsletterForm from '@/components/dentista-joao/NewsletterForm'

const BASE = '/projetos-especiais/dentista-joao'

const LINKS = [
  { label: 'A Clínica',           href: `${BASE}/a-clinica` },
  { label: 'Tratamentos',         href: `${BASE}/tratamentos` },
  { label: 'Equipe',              href: `${BASE}/equipe` },
  { label: 'Dúvidas Frequentes',  href: `${BASE}/duvidas-frequentes` },
  { label: 'Contato',             href: `${BASE}/contato` },
]

export default function SiteFooter({ site }: { site: SiteEspecial }) {
  const waLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=Olá%2C%20peguei%20esse%20contato%20no%20site`
    : null

  return (
    <footer className="bg-[#0B2B3C] text-white/70 text-sm mt-0">
      <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Coluna 1 — logo + descrição + contatos */}
        <div>
          {/* Logo-texto com estilo similar ao do Dr. Fábio Sato */}
          <div className="mb-4">
            <p className="font-display font-extrabold text-white text-xl leading-tight">{site.business_name}</p>
            <p className="text-[#0EA5A0] text-xs font-bold uppercase tracking-widest mt-0.5">Clínica Odontológica</p>
          </div>
          <p className="text-sm leading-relaxed mb-5 text-white/60">
            {site.tagline ? site.tagline.slice(0, 120) + (site.tagline.length > 120 ? '…' : '') : 'Atendimento humanizado e tratamentos de excelência.'}
          </p>
          <div className="w-16 border-t border-white/20 mb-4" />
          <ul className="flex flex-col gap-2 text-sm">
            {site.telefone && (
              <li>
                <a href={`tel:${site.telefone.replace(/\D/g,'')}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  📞 {site.telefone}
                </a>
              </li>
            )}
            {waLink && (
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  💬 {site.whatsapp ? formatTelefoneExibicao(site.whatsapp) : 'WhatsApp'}
                </a>
              </li>
            )}
            {site.endereco && (
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>{site.endereco}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Coluna 2 — links + redes sociais */}
        <div>
          <p className="font-display font-bold text-white mb-3">Links</p>
          <div className="w-8 border-t border-[#0EA5A0] mb-4" />
          <ul className="flex flex-col gap-2 mb-8">
            {LINKS.map(l => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
          {site.instagram_handle && (
            <>
              <p className="font-display font-bold text-white mb-3">Redes Sociais</p>
              <div className="w-8 border-t border-[#0EA5A0] mb-4" />
              <div className="flex items-center gap-3">
                <a
                  href={`https://instagram.com/${site.instagram_handle.replace('@','')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0EA5A0] transition-colors text-base"
                  title="Instagram"
                >
                  📸
                </a>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors text-base"
                    title="WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Coluna 3 — newsletter */}
        <div>
          <p className="font-display font-bold text-white mb-3">News</p>
          <div className="w-8 border-t border-[#0EA5A0] mb-4" />
          <p className="mb-4 text-white/60">Inscreva-se em nossa newsletter para receber nossos informativos.</p>
          <NewsletterForm />
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/30">
        © {new Date().getFullYear()} {site.business_name}. Todos os direitos reservados.
        <span className="mx-2">·</span>
        Site desenvolvido por Omnidesign
      </div>
    </footer>
  )
}
