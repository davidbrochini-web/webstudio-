import type { SiteEspecial } from '@/lib/colegio-elite'
import ScrollComSetas from '@/components/ui/ScrollComSetas'

/**
 * Faixa de Instagram logo abaixo do banner principal (pedido do
 * cliente). A integração real com a API do Instagram ainda não foi
 * habilitada na plataforma (aprovação de app externo pendente —
 * PROJETOS_ESPECIAIS.md, seção 6.2), então isso é uma prévia com fotos
 * reais da escola, honesta sobre o que é: não finge ser um feed ao
 * vivo, e linka direto pro perfil de verdade. Quando a integração for
 * habilitada, troca por posts reais sem mudar a posição na página.
 */
export default function InstagramFeedStrip({ site, fotos }: { site: SiteEspecial; fotos: string[] }) {
  if (!site.instagram_visivel || !site.instagram_handle) return null
  const handle = site.instagram_handle.replace('@', '')
  const link = `https://instagram.com/${handle}`

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {site.business_name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ce-secondary)] leading-tight">@{handle}</p>
            <p className="text-xs text-slate-400">Confira mais no nosso Instagram</p>
          </div>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--ce-primary)] hover:opacity-80 whitespace-nowrap flex-shrink-0">
          Seguir →
        </a>
      </div>

      <ScrollComSetas>
        <div className="flex gap-3 px-6 pb-2 justify-start lg:justify-center" style={{ minWidth: 'min-content' }}>
          {fotos.map((url, i) => (
            <a
              key={url}
              href={link} target="_blank" rel="noopener noreferrer"
              className="relative flex-shrink-0 w-[160px] sm:w-[200px] aspect-square rounded-2xl overflow-hidden bg-slate-200 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </a>
          ))}
        </div>
      </ScrollComSetas>

      <p className="text-center text-xs text-slate-400 mt-5 px-6">
        Posts reais do Instagram do colégio — a sincronização automática entra assim que a integração com a API for habilitada.
      </p>
    </section>
  )
}
