import { texto } from '@/lib/textos-customizados'
import type { SiteEspecial } from '@/lib/colegio-elite'

/**
 * Barra de links externos que fica acima do menu principal — mesma
 * posição/função da barra do site antigo (elite.g12.br), que tinha 2
 * imagens-botão lado a lado linkando pra sistemas de terceiros:
 * WebCanal da Escola (plataforma de vídeos/comunicados) e Área do
 * Aluno (portal acadêmico em colegioelite.g12.br). Fora de escopo
 * deste projeto integrar esses sistemas de verdade — só preservamos
 * o link, exatamente como no site original.
 *
 * Totalmente editável pelo painel (imagem/link/visibilidade de cada
 * botão, gravado em textos_customizados) — caso a escola troque de
 * sistema ou não queira mais um dos dois no ar.
 */

const BASE_URL = 'https://evlrrtwobsegggvykphr.supabase.co/storage/v1/object/public/site-fotos/colegio-elite/b9b5f561-f53d-4f8d-b932-3696e1c30d96'

const PADRAO = {
  webcanal: {
    img: `${BASE_URL}/webcanal-escola.png`,
    href: 'https://webcanaldaescola.com.br/100/',
    alt: 'WebCanal da Escola — clique aqui',
  },
  aluno: {
    img: `${BASE_URL}/btn-area-aluno.png`,
    href: 'http://www.colegioelite.g12.br/',
    alt: 'Área do Aluno',
  },
}

export default function TopLinksBar({ site }: { site: SiteEspecial }) {
  const t = site.textos_customizados

  const links = [
    {
      key: 'webcanal',
      href: texto(t, 'topo_webcanal_url', PADRAO.webcanal.href),
      img: texto(t, 'topo_webcanal_img', PADRAO.webcanal.img),
      alt: PADRAO.webcanal.alt,
      visivel: texto(t, 'topo_webcanal_visivel', 'true') !== 'false',
    },
    {
      key: 'aluno',
      href: texto(t, 'topo_aluno_url', PADRAO.aluno.href),
      img: texto(t, 'topo_aluno_img', PADRAO.aluno.img),
      alt: PADRAO.aluno.alt,
      visivel: texto(t, 'topo_aluno_visivel', 'true') !== 'false',
    },
  ].filter(l => l.visivel)

  if (!links.length) return null

  return (
    <div className="bg-[var(--ce-secondary)] px-4 sm:px-6 py-2 flex items-center justify-end gap-4">
      {links.map(l => (
        <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.img} alt={l.alt} className="h-7 sm:h-8 w-auto" />
        </a>
      ))}
    </div>
  )
}
