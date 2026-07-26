import type { Metadata } from 'next'
import { niches } from '@/lib/templates'
import { unsplashPhotoFrom } from '@/lib/photos'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Teste você mesmo — sem cadastro',
  description: 'Escolha um modelo de site e edite na hora, sem precisar de login ou senha. Veja como é fácil antes de contratar.',
  robots: { index: false },
}

const descs: Record<string, string> = {
  'clinica-odontologica': 'Agendamento pelo WhatsApp, tratamentos em destaque e antes/depois direto do Instagram.',
  'escola-curso': 'Captação de matrículas, grade de cursos e mural de atividades atualizado pelo Instagram.',
  'estudio-fotografia': 'Portfólio que se atualiza sozinho a cada ensaio postado. Orçamento em um clique.',
  'advocacia': 'Presença profissional, áreas de atuação e formulário de contato direto para triagem.',
  'barbearia-salao': 'Agenda pelo WhatsApp, tabela de serviços e feed dos trabalhos mais recentes.',
  'academia-personal': 'Planos em destaque, aula experimental via WhatsApp e resultados dos alunos no feed.',
  'clinica-massagem': 'Agendamento de sessões, serviços de bem-estar e dicas de autocuidado no feed.',
}

const ERROR_MESSAGES: Record<string, string> = {
  'nicho-invalido': 'Esse modelo não existe. Escolha um dos abaixo.',
  'login': 'Não conseguimos iniciar a demo agora. Tenta de novo em alguns segundos.',
  'tenant': 'Erro ao preparar sua demo. Tenta de novo.',
  'seed': 'Erro ao montar o conteúdo do site. Tenta de novo.',
  'setup': 'Erro ao finalizar a preparação. Tenta de novo.',
}

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams
  const errorMessage = erro ? (ERROR_MESSAGES[erro] ?? 'Algo deu errado. Tenta de novo.') : null

  return (
    <>
      <Navbar />
      <main className="bg-[var(--off)] min-h-screen">
        <section className="px-6 pt-16 pb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--brand)] mb-3">
            Teste você mesmo
          </p>
          <h1 className="font-display font-extrabold text-[clamp(28px,6vw,46px)] leading-tight text-[var(--ink)] mb-4">
            Sem cadastro. Sem senha. Sem enrolação.
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed">
            Escolha o modelo mais parecido com o seu negócio e você já cai editando
            o site — clicando direto em cima do texto e da foto, igual vai ser de verdade.
            Leva 10 segundos.
          </p>
          {errorMessage && (
            <p className="mt-6 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 inline-block">
              {errorMessage}
            </p>
          )}
        </section>

        <section className="px-6 pb-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {niches.map(({ slug, label, photoIds }) => (
              <a
                key={slug}
                href={`/demo/iniciar?nicho=${slug}`}
                className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[var(--brand)] transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={unsplashPhotoFrom(photoIds, 0, 500, 320)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1.5">{label}</h2>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{descs[slug]}</p>
                  <span className="text-sm font-semibold text-[var(--brand)] group-hover:underline">
                    Testar agora →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
