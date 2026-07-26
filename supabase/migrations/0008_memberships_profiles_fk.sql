-- ============================================================
-- 0008_memberships_profiles_fk.sql
--
-- BUG ENCONTRADO EM TESTE (sessão de QA): a listagem de usuários de um
-- tenant sempre aparecia vazia, mesmo com memberships reais no banco.
--
-- Causa raiz: app/admin/tenants/[id]/page.tsx faz
--   .from('memberships').select('id, papel, user_id, profiles(nome)')
-- que depende do PostgREST conseguir "embedar" profiles a partir de
-- memberships. Isso exige uma foreign key DIRETA entre as duas tabelas.
--
-- O que existe hoje: memberships.user_id -> auth.users(id) e
-- profiles.id -> auth.users(id) — as duas apontam pro mesmo lugar, mas
-- não uma pra outra. PostgREST não infere relacionamento por tabela
-- intermediária, então a query falhava com PGRST200 ("Could not find
-- a relationship between memberships and profiles"). O erro era
-- descartado silenciosamente no código (`const { data } = await ...`),
-- por isso nunca apareceu como erro na tela — só como lista vazia.
--
-- Correção: adiciona uma segunda FK em memberships.user_id apontando
-- pra profiles(id). É seguro porque profiles.id sempre espelha um
-- auth.users.id existente (profiles é 1:1, criado logo após o auth user
-- em createTenantUser) — ambas as FKs coexistem sem conflito.
-- ============================================================

alter table memberships
  add constraint memberships_user_id_profiles_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
