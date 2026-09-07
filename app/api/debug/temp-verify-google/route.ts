import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// TEMPORÁRIO — validação do módulo Google, remover na mesma resposta.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'omnidesign-verify-google-modulo-temp-07092026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: 'https://omnidesign.com.br/redefinir-senha' },
  })
  if (error || !data?.properties?.action_link) {
    return NextResponse.json({ error: error?.message ?? 'sem link' }, { status: 500 })
  }
  return NextResponse.json({ link: data.properties.action_link })
}
