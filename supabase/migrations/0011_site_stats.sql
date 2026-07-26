-- ============================================================
-- 0011_site_stats.sql
--
-- A "barra de confiança" (ex: "+15 anos de experiência", "+3.200
-- pacientes atendidos", "4.9★ avaliação média") era hardcoded dentro
-- de ClinicoLayout.tsx — não vinha do tenant, então não dava pra
-- editar. Vira conteúdo de verdade, editável, com o mesmo padrão das
-- outras tabelas filhas de site (site_servicos, site_depoimentos...).
--
-- Não é específico de um nicho — outros arquétipos podem adotar o
-- mesmo padrão de "números em destaque" no futuro.
-- ============================================================

create table site_stats (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  valor       text not null,
  rotulo      text not null,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create trigger trg_site_stats_updated before update on site_stats
  for each row execute function set_updated_at();

alter table site_stats enable row level security;

create policy site_stats_select on site_stats for select
  using (
    is_member_of_site(site_id) or is_super_admin()
    or is_site_publicado(site_id)
  );

create policy site_stats_insert on site_stats for insert
  with check (is_admin_of_site(site_id) or is_super_admin());

create policy site_stats_update on site_stats for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());

create policy site_stats_delete on site_stats for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- authenticated/service_role já herdam via default privileges
-- (0004/0007); falta só anon, igual as outras tabelas de site (0009).
grant select on site_stats to anon;
