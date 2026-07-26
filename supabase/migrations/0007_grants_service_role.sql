-- ============================================================
-- 0007_grants_service_role.sql
--
-- BUG ENCONTRADO EM TESTE (sessão de QA pós-auditoria): a 0004_grants
-- concedeu privilégios em todas as tabelas só para o papel `authenticated`,
-- esquecendo `service_role` — que é exatamente o papel usado pelo client
-- admin (lib/supabase/admin.ts) para criar usuário de cliente.
--
-- service_role BYPASSA RLS, mas RLS e GRANT são mecanismos independentes:
-- RLS só restringe o que já foi concedido por GRANT. Sem o GRANT, toda
-- operação do client admin falha com "permission denied for table X"
-- (42501) mesmo sendo service_role — foi isso que quebrou
-- createTenantUser em teste (insert em `profiles`).
--
-- O rollback adicionado nesta mesma sessão funcionou corretamente
-- (nenhum usuário órfão ficou no Auth), mas o fluxo em si estava 100%
-- bloqueado até esta correção.
-- ============================================================

grant usage on schema public to service_role;

grant select, insert, update, delete
  on tenants, profiles, memberships, subscriptions,
     funcionarios, produtos_servicos, clientes, fornecedores
  to service_role;

grant usage, select on all sequences in schema public to service_role;

grant execute on function
  is_member_of_tenant(uuid),
  is_super_admin(),
  is_admin_of_tenant(uuid)
  to service_role;

-- Default privileges: módulos futuros herdam automaticamente, tanto para
-- authenticated (já coberto na 0004) quanto para service_role agora.
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to service_role;

alter default privileges in schema public
  grant execute on functions to service_role;
