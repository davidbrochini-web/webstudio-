import type { Metadata } from 'next'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import PageBanner from '@/components/dentista-joao/PageBanner'
import MeusAgendamentos from '@/components/dentista-joao/MeusAgendamentos'

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Meus Agendamentos' }
}

export default async function MeusAgendamentosPage() {
  const site = await getSiteEspecial()

  return (
    <PageShell site={site}>
      <PageBanner title="Meus Agendamentos" imageUrl={site.hero_imagem_url} />
      <section className="px-6 py-16">
        <MeusAgendamentos />
      </section>
    </PageShell>
  )
}
