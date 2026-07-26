import { getCurrentTenant } from '@/lib/current-tenant'
import Link from 'next/link'

export default async function CadastrosHome() {
  const info = await getCurrentTenant()
  if (!info) return <p className="text-sm text-[var(--muted)]">Sua conta não está vinculada a nenhuma empresa.</p>

  const itens = [
    { href: '/app/cadastros/clientes', label: 'Clientes', desc: 'Pessoas físicas e jurídicas que compram de você.' },
    { href: '/app/cadastros/fornecedores', label: 'Fornecedores', desc: 'Quem fornece produtos ou serviços pro seu negócio.' },
    { href: '/app/cadastros/funcionarios', label: 'Funcionários', desc: 'Sua equipe: cargo, admissão e contato.' },
    { href: '/app/cadastros/produtos-servicos', label: 'Produtos/Serviços', desc: 'O que você vende, com preço e unidade.' },
  ]

  return (
    <div>
      <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] mb-4 inline-block">← Voltar</Link>
      <h1 className="font-display font-extrabold text-2xl text-[var(--ink)] mb-6">Cadastros</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {itens.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--brand)] hover:shadow-lg transition-all"
          >
            <h2 className="font-display font-bold text-base text-[var(--ink)] mb-1">{item.label}</h2>
            <p className="text-sm text-[var(--muted)]">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
