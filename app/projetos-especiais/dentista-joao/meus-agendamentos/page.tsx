import type { Metadata } from 'next'
import { getSiteEspecial, getBasePath } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import MeusAgendamentos from '@/components/dentista-joao/MeusAgendamentos'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Meus Agendamentos',
    description: 'Consulte ou cancele seu agendamento.',
    robots: { index: false, follow: true },
  }
}

export default async function MeusAgendamentosPage() {
  const site = await getSiteEspecial()
  const base = await getBasePath()

  return (
    <PageShell site={site}>
      <PageBanner title="Meus Agendamentos" imageUrl={site.hero_imagem_url} base={base} />
      <section className="px-6 py-16">
        <MeusAgendamentos />
      </section>
    </PageShell>
  )
}
