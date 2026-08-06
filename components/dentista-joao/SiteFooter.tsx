import type { SiteEspecial } from '@/lib/dentista-joao'
import { formatTelefoneExibicao } from '@/lib/dentista-joao'
import NewsletterForm from '@/components/dentista-joao/NewsletterForm'
import Link from 'next/link'
import { IconWhatsApp, IconInstagram } from '@/components/dentista-joao/icons'

const BASE = '/projetos-especiais/dentista-joao'

export default function SiteFooter({ site }: { site: SiteEspecial }) {
  // Mesmo gate de visibilidade do SiteNav — seção oculta no painel
  // some do rodapé também.
  const LINKS = [
    { label: 'A Clínica',          href: `${BASE}/a-clinica`, show: true },
    { label: 'Tratamentos',        href: `${BASE}/tratamentos`, show: site.secao_tratamentos_visivel },
    { label: 'Cursos e Eventos',   href: `${BASE}/cursos-e-eventos`, show: site.secao_cursos_visivel },
    { label: 'Equipe',             href: `${BASE}/equipe`, show: site.secao_equipe_visivel },
    { label: 'Dúvidas Frequentes', href: `${BASE}/duvidas-frequentes`, show: site.secao_faq_visivel },
    { label: 'Contato',            href: `${BASE}/contato`, show: true },
  ].filter(item => item.show)

  const waLink = site.whatsapp
    ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta`
    : null
  const mapsQuery = site.endereco
    ? `https://maps.google.com/maps?q=${encodeURIComponent(site.endereco)}&output=embed`
    : null

  return (
    <footer className="bg-[var(--dj-secondary)] text-white/70 text-sm">

      {/* Faixa CTA acima do footer */}
      <div className="bg-[var(--dj-primary)] px-5 sm:px-6 py-10 text-center">
        <p className="font-display font-extrabold text-white text-2xl sm:text-3xl mb-2">
          Pronto para sorrir com confiança?
        </p>
        <p className="text-white/90 text-sm mb-6">
          Agende sua consulta e descubra o tratamento ideal para você.
        </p>
        <Link
          href={`${BASE}/contato`}
          className="inline-block bg-white text-[var(--dj-secondary)] font-bold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg text-sm"
        >
          Agendar Consulta →
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Coluna 1 — identidade + contatos */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display font-extrabold text-white text-xl leading-tight">{site.business_name}</p>
          <p className="text-[var(--dj-primary)] text-[10px] font-bold uppercase tracking-widest mt-0.5 mb-4">Clínica Odontológica</p>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            {site.tagline
              ? (site.tagline.length > 110 ? site.tagline.slice(0, 110) + '…' : site.tagline)
              : 'Atendimento humanizado e tratamentos de excelência para toda a família.'}
          </p>
          <div className="w-10 h-0.5 bg-[var(--dj-primary)] mb-5 rounded-full" />
          <ul className="flex flex-col gap-3">
            {site.telefone && (
              <li>
                <a href={`tel:${site.telefone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2.5 hover:text-white transition-colors group">
                  <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[var(--dj-primary)] flex items-center justify-center text-sm transition-colors flex-shrink-0">📞</span>
                  <span>{site.telefone}</span>
                </a>
              </li>
            )}
            {waLink && (
              <li>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors group">
                  <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#25D366] flex items-center justify-center text-sm transition-colors flex-shrink-0">💬</span>
                  <span>{site.whatsapp ? formatTelefoneExibicao(site.whatsapp) : 'WhatsApp'}</span>
                </a>
              </li>
            )}
            {site.endereco && (
              <li className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">📍</span>
                <span className="leading-snug">{site.endereco}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Coluna 2 — links */}
        <div>
          <p className="font-display font-bold text-white mb-1 text-base">Navegação</p>
          <div className="w-8 h-0.5 bg-[var(--dj-primary)] mb-5 rounded-full" />
          <ul className="flex flex-col gap-2.5">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href}
                  className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[var(--dj-primary)] flex-shrink-0" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Redes sociais */}
          {((site.instagram_visivel && site.instagram_handle) || waLink) && (
            <div className="mt-8">
              <p className="font-display font-bold text-white mb-1 text-base">Siga-nos</p>
              <div className="w-8 h-0.5 bg-[var(--dj-primary)] mb-4 rounded-full" />
              <div className="flex gap-3">
                {site.instagram_visivel && site.instagram_handle && (
                  <a href={`https://instagram.com/${site.instagram_handle.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    title="Instagram"
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743] flex items-center justify-center transition-all">
                    <IconInstagram className="w-4.5 h-4.5" />
                  </a>
                )}
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    title="WhatsApp"
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-all">
                    <IconWhatsApp className="w-4.5 h-4.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3 — newsletter */}
        <div>
          <p className="font-display font-bold text-white mb-1 text-base">Newsletter</p>
          <div className="w-8 h-0.5 bg-[var(--dj-primary)] mb-5 rounded-full" />
          <p className="text-white/60 text-sm mb-5 leading-relaxed">
            Receba dicas de saúde bucal e novidades da clínica direto no seu e-mail.
          </p>
          <NewsletterForm />
        </div>

        {/* Coluna 4 — mapa embed (quando tiver endereço real) */}
        {mapsQuery ? (
          <div>
            <p className="font-display font-bold text-white mb-1 text-base">Localização</p>
            <div className="w-8 h-0.5 bg-[var(--dj-primary)] mb-5 rounded-full" />
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg aspect-[4/3]">
              <iframe
                src={mapsQuery}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Localização — ${site.business_name}`}
              />
            </div>
          </div>
        ) : (
          /* placeholder elegante enquanto endereço real não chega */
          <div>
            <p className="font-display font-bold text-white mb-1 text-base">Localização</p>
            <div className="w-8 h-0.5 bg-[var(--dj-primary)] mb-5 rounded-full" />
            <div className="rounded-xl bg-white/5 border border-white/10 aspect-[4/3] flex flex-col items-center justify-center gap-2 text-white/30">
              <span className="text-3xl">🗺️</span>
              <span className="text-xs">Endereço em breve</span>
            </div>
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
        <span>© {new Date().getFullYear()} {site.business_name}. Todos os direitos reservados.</span>
        <span>Site desenvolvido por <span className="text-[var(--dj-primary)] font-semibold">Omnidesign</span></span>
      </div>
    </footer>
  )
}
