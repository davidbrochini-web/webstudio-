-- ============================================================
-- 0003_cadastros_rls.sql
-- Isolamento por tenant nas 4 tabelas de Cadastros.
--
-- Regra: qualquer membro do tenant (owner/admin/operador) pode
-- LER. Só owner/admin pode CRIAR, EDITAR ou EXCLUIR. Operador é
-- leitura — ajuste depois se precisar de mais granularidade por
-- módulo (ex: operador de estoque edita produtos mas não vê RH).
-- ============================================================

-- ── função central: usuário é owner/admin do tenant? ────────────
create or replace function is_admin_of_tenant(t_id uuid) returns boolean as $$
  select exists (
    select 1 from memberships
    where tenant_id = t_id
      and user_id = auth.uid()
      and papel in ('owner', 'admin')
  );
$$ language sql stable security definer;

-- ── habilita RLS nas 4 tabelas ──────────────────────────────────
alter table funcionarios enable row level security;
alter table produtos_servicos enable row level security;
alter table clientes enable row level security;
alter table fornecedores enable row level security;

-- ── funcionarios ─────────────────────────────────────────────
create policy funcionarios_select on funcionarios for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy funcionarios_insert on funcionarios for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy funcionarios_update on funcionarios for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy funcionarios_delete on funcionarios for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

-- ── produtos_servicos ────────────────────────────────────────
create policy produtos_servicos_select on produtos_servicos for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy produtos_servicos_insert on produtos_servicos for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy produtos_servicos_update on produtos_servicos for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy produtos_servicos_delete on produtos_servicos for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

-- ── clientes ─────────────────────────────────────────────────
create policy clientes_select on clientes for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy clientes_insert on clientes for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy clientes_update on clientes for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy clientes_delete on clientes for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

-- ── fornecedores ─────────────────────────────────────────────
create policy fornecedores_select on fornecedores for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy fornecedores_insert on fornecedores for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy fornecedores_update on fornecedores for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy fornecedores_delete on fornecedores for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());
