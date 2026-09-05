import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('impersonate_tenant')
  return NextResponse.redirect(new URL('/admin/tenants', request.url))
}
