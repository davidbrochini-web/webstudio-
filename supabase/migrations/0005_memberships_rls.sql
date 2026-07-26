-- ============================================================
-- 0005_memberships_rls.sql
--
-- BUG ENCONTRADO ANTES DE IR AO AR: a 0001 habilitou RLS em
-- `memberships` mas só criou política de SELECT. Trocar o papel
-- de um usuário (owner/admin/operador) pelo painel super-admin
-- ia falhar silenciosamente — RLS nega por padrão quando não
-- existe política para o comando (UPDATE, no caso).
--
-- A criação de membership em si (createTenantUser) usa o client
-- admin (service_role, bypassa RLS) — mas INSERT/UPDATE/DELETE
-- via client normal (ex: tenant editando a própria equipe no
-- futuro) precisam de política, senão quebram do mesmo jeito.
-- ============================================================

create policy memberships_insert on memberships for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy memberships_update on memberships for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin())
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy memberships_delete on memberships for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());
