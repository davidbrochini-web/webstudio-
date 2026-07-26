-- ============================================================
-- 0016_hardening_secdef_grants.sql
--
-- Duas correções de hardening achadas em auditoria:
--
-- 1. Funções SECURITY DEFINER sem `search_path` fixo.
--    Sem isso, quem chama a função pode influenciar o search_path
--    da sessão e, em teoria, fazer a função resolver `profiles`/
--    `memberships` pra objetos de outro schema controlado pelo
--    atacante (clássico alerta do Security Advisor do Supabase).
--    Fixamos em `public, pg_temp` — as funções só referenciam
--    tabelas de public e auth.uid() (schema-qualificado).
--
-- 2. Grants residuais de TRUNCATE/TRIGGER/REFERENCES pra
--    anon/authenticated em todas as tabelas (herança do GRANT ALL
--    padrão). Não são exploráveis via PostgREST (a API só expõe
--    SELECT/INSERT/UPDATE/DELETE), mas TRUNCATE ignora RLS por
--    definição — não faz sentido esses papéis terem isso. Higiene:
--    revogar agora e ajustar default privileges pra módulos futuros
--    não herdarem de novo.
-- ============================================================

-- 1) search_path fixo nas security definer
alter function public.is_super_admin() set search_path = public, pg_temp;
alter function public.is_member_of_tenant(uuid) set search_path = public, pg_temp;
alter function public.is_admin_of_tenant(uuid) set search_path = public, pg_temp;
alter function public.is_member_of_site(uuid) set search_path = public, pg_temp;
alter function public.is_admin_of_site(uuid) set search_path = public, pg_temp;
alter function public.is_site_publicado(uuid) set search_path = public, pg_temp;

-- 2) revogar privilégios que client de API nunca deve ter
revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;

alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
