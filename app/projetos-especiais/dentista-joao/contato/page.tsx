import type { Metadata } from 'next'
import { getSiteEspecial } from '@/lib/dentista-joao'
import PageShell from '@/components/dentista-joao/PageShell'
import ContatoForm from '@/components/dentista-joao/ContatoForm'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteEspecial()
  return { title: `Contato — ${site.business_name}`, robots: { index: site.status === 'publicado' } }
}

export default async function ContatoPage() {
  const site = await getSiteEspecial()

  return (
    <PageShell site={site}>
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-[#0B2B3C] mb-2">Marcar consulta</h1>
        <p className="text-slate-500 mb-8">Preencha o formulário e retornamos pra confirmar o melhor horário.</p>
        <ContatoForm />

        <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-500 flex flex-col gap-1">
          {site.telefone && <p>📞 {site.telefone}</p>}
          {site.whatsapp && <p>💬 {site.whatsapp}</p>}
          {site.endereco && <p>📍 {site.endereco}</p>}
        </div>
      </section>
    </PageShell>
  )
}
