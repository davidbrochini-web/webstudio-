import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ehPrefetch } from '@/lib/route-prefetch'

// Prefetch do <Link> nunca pode trocar/apagar o cookie de impersonação.
export async function GET(request: NextRequest) {
  if (ehPrefetch(request)) return new NextResponse(null, { status: 204 })
  const cookieStore = await cookies()
  cookieStore.delete('impersonate_tenant')
  return NextResponse.redirect(new URL('/admin/tenants', request.url))
}
