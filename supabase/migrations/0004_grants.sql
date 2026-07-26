-- ============================================================
-- 0004_grants.sql
--
-- BUG ENCONTRADO EM PRODUÇÃO: tabelas criadas via SQL direto
-- (Management API) não recebem GRANT automático para o papel
-- `authenticated`, diferente de quando se cria tabela pela
-- interface do Supabase (que faz isso nos bastidores).
--
-- RLS por si só não dá acesso nenhum — ele só RESTRINGE o que já
-- foi concedido por GRANT. Sem o GRANT abaixo, toda query dá
-- "permission denied for table X" (42501), mesmo com a policy de
-- RLS certinha.
--
-- Esta migration corrige as 8 tabelas existentes e configura
-- default privileges para que módulos futuros herdem isso
-- automaticamente, sem precisar lembrar de novo.
-- ============================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on tenants, profiles, memberships, subscriptions,
     funcionarios, produtos_servicos, clientes, fornecedores
  to authenticated;

-- Sequences (nenhuma hoje, pois tudo usa uuid, mas garante se algo
-- futuro usar serial/bigserial)
grant usage, select on all sequences in schema public to authenticated;

-- Funções auxiliares de RLS precisam ser executáveis pelo papel
grant execute on function
  is_member_of_tenant(uuid),
  is_super_admin(),
  is_admin_of_tenant(uuid)
  to authenticated;

-- ── Default privileges: tabelas/funções FUTURAS herdam isso ──────
-- Sem isso, todo módulo novo (contas a pagar, estoque, etc.) vai
-- repetir o mesmo bug até alguém lembrar de rodar GRANT manual.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;

alter default privileges in schema public
  grant execute on functions to authenticated;
