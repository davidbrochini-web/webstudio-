import type { Metadata } from 'next'

// Login não deve ser indexado nunca, independente do SITE_INDEXAVEL
// global — não é conteúdo, e não faz sentido aparecer numa busca.
export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
