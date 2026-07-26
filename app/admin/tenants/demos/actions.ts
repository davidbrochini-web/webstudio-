'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { revalidatePath } from 'next/cache'

/**
 * Apaga um tenant demo por completo: o registro do tenant (cascade
 * cuida de site, memberships, subscriptions etc) e também o usuário
 * anônimo do Supabase Auth vinculado a ele — senão o auth.users fica
 * acumulando contas anônimas órfãs pra sempre.
 */
export async function deleteDemoTenant(tenantId: string) {
  await requireSuperAdmin()
  const admin = createAdminClient()

  const { data: tenant } = await admin
    .from('tenants')
    .select('id, is_demo')
    .eq('id', tenantId)
    .single()

  if (!tenant?.is_demo) {
    throw new Error('Esse tenant não é uma demo — recusando apagar por segurança.')
  }

  const { data: memberships } = await admin
    .from('memberships')
    .select('user_id')
    .eq('tenant_id', tenantId)

  const { error: deleteError } = await admin.from('tenants').delete().eq('id', tenantId)
  if (deleteError) throw new Error(deleteError.message)

  for (const m of memberships ?? []) {
    await admin.auth.admin.deleteUser(m.user_id).catch(() => {
      // se o usuário já não existir por algum motivo, segue em frente
    })
  }

  revalidatePath('/admin/tenants/demos')
  revalidatePath('/admin/tenants')
}
