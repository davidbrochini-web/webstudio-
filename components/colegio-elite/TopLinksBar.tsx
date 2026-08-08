/**
 * Barra de links externos que fica acima do menu principal — mesma
 * posição/função da barra do site antigo (elite.g12.br), que tinha 2
 * imagens-botão lado a lado linkando pra sistemas de terceiros:
 * WebCanal da Escola (plataforma de vídeos/comunicados) e Área do
 * Aluno (portal acadêmico em colegioelite.g12.br). Fora de escopo
 * deste projeto integrar esses sistemas — só preservamos o link,
 * exatamente como no site original (decisão confirmada com o David).
 *
 * Imagens re-hospedadas no nosso Storage (eram servidas direto do
 * WordPress antigo) — mesmos arquivos, mesmo destino.
 */

const BASE_URL = 'https://evlrrtwobsegggvykphr.supabase.co/storage/v1/object/public/site-fotos/colegio-elite/b9b5f561-f53d-4f8d-b932-3696e1c30d96'

const LINKS = [
  {
    href: 'https://webcanaldaescola.com.br/100/',
    img: `${BASE_URL}/webcanal-escola.png`,
    alt: 'WebCanal da Escola — clique aqui',
  },
  {
    href: 'http://www.colegioelite.g12.br/',
    img: `${BASE_URL}/btn-area-aluno.png`,
    alt: 'Área do Aluno',
  },
]

export default function TopLinksBar() {
  return (
    <div className="bg-[var(--ce-secondary)] px-4 sm:px-6 py-2 flex items-center justify-end gap-4">
      {LINKS.map(l => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.img} alt={l.alt} className="h-7 sm:h-8 w-auto" />
        </a>
      ))}
    </div>
  )
}
