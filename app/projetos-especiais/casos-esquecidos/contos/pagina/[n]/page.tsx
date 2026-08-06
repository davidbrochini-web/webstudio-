import ContosArchive from '@/components/casos-esquecidos/ContosArchive'
import { getSiteEspecial, getBasePath } from '@/lib/casos-esquecidos'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR — conteúdo público, republica a cada 1h no máximo

export default async function ContosPaginaPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params
  const pagina = parseInt(n, 10)
  if (!Number.isInteger(pagina) || pagina < 1) notFound()

  const site = await getSiteEspecial()
  const base = await getBasePath()
  return <ContosArchive siteId={site.id} pagina={pagina} base={base} />
}
