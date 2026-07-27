-- ============================================================
-- 0021_projetos_especiais_dentista_joao.sql
--
-- Infraestrutura pra linha "Projetos Especiais" (ver
-- PROJETOS_ESPECIAIS.md) + o schema específico do primeiro cliente
-- oficial dessa linha (HANDOFF_DEV_Projeto_Especial_01.md).
--
-- Decisão de arquitetura (confirmada com o David): projeto especial
-- NÃO reaproveita o arquétipo "clinico" compartilhado — cada projeto
-- especial ganha seu PRÓPRIO valor de pagelayout, isolado dos 7
-- arquétipos do catálogo. Motivo: são clientes que pagaram por algo
-- sob medida; um bug numa expansão do Clínico compartilhado afetaria
-- a Sorrir Odonto e a demo pública, que não têm nada a ver com esse
-- contrato. Cada projeto especial novo = sua própria migration
-- estendendo o CHECK com o valor dele, mesmo espírito "não comparar
-- com o catálogo" do guia.
--
-- `tenants.projeto_especial_slug`: null = tenant normal (catálogo/
-- self-service). Preenchido = é um projeto especial; o valor é o
-- slug usado em /projetos-especiais/[slug] e /projetos-especiais/
-- [slug]/login, e também o que aciona a navegação extra no /app
-- (fora do sistema de módulos — não é gate por subscription).
-- ============================================================

alter table tenants add column projeto_especial_slug text unique;

alter table sites drop constraint sites_pagelayout_check;
alter table sites add constraint sites_pagelayout_check
  check (pagelayout = any (array[
    'clinico', 'editorial', 'portfolio', 'urbano', 'performance', 'zen', 'acolhedor',
    'dentista-joao'  -- ★ pagelayout dedicado deste projeto especial
  ]));

-- ── extensões em tabelas que já existem (reaproveitadas por todo
--    site, catálogo ou especial — todas as colunas novas são
--    nullable, então nada muda pro que já está em produção) ────────

alter table site_blog_posts
  add column meta_titulo text,
  add column meta_descricao text,
  add column imagem_og text,
  add column alt_text text;

alter table site_faq
  add column categoria text;

alter table site_leads
  add column data_desejada date,
  add column periodo text check (periodo is null or periodo in ('manha', 'tarde'));

alter table sites
  add column telefone text,
  add column endereco text;

-- ── tabelas novas — só fazem sentido pra projeto especial hoje, mas
--    seguem o padrão genérico de "conteúdo por site" (site_id),
--    então qualquer projeto futuro pode reaproveitar sem migration
--    de schema, só populando ────────────────────────────────────────

create table site_tratamentos (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references sites(id) on delete cascade,
  slug              text not null,
  titulo            text not null,
  descricao_curta   text not null default '',
  descricao_completa text not null default '',
  imagem_url        text,
  alt_text          text,
  meta_titulo       text,
  meta_descricao    text,
  imagem_og         text,
  publicado         boolean not null default true,
  ordem             int not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id),
  deleted_at        timestamptz,

  unique (site_id, slug)
);

create table site_equipe (
  id             uuid primary key default gen_random_uuid(),
  site_id        uuid not null references sites(id) on delete cascade,
  nome           text not null,
  foto_url       text,
  alt_text       text,
  formacao       text,
  especialidade  text,
  ordem          int not null default 0,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

create table site_cursos_eventos (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references sites(id) on delete cascade,
  slug            text not null,
  titulo          text not null,
  descricao       text not null default '',
  data_evento     date,
  imagem_url      text,
  alt_text        text,
  meta_titulo     text,
  meta_descricao  text,
  imagem_og       text,
  publicado       boolean not null default true,
  ordem           int not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id),
  deleted_at      timestamptz,

  unique (site_id, slug)
);

create trigger trg_site_tratamentos_updated before update on site_tratamentos
  for each row execute function set_updated_at();
create trigger trg_site_equipe_updated before update on site_equipe
  for each row execute function set_updated_at();
create trigger trg_site_cursos_eventos_updated before update on site_cursos_eventos
  for each row execute function set_updated_at();

alter table site_tratamentos enable row level security;
alter table site_equipe enable row level security;
alter table site_cursos_eventos enable row level security;

-- mesmo padrão de site_blog_posts (0017): publicado=true + site
-- publicado pra visitante; membro/admin/super-admin veem tudo
do $$
declare
  t text;
begin
  foreach t in array array['site_tratamentos', 'site_cursos_eventos']
  loop
    execute format($f$
      create policy %1$I_select on %1$I for select
        using (
          is_member_of_site(site_id) or is_super_admin()
          or (is_site_publicado(site_id) and publicado = true)
        );
    $f$, t);

    execute format($f$
      create policy %1$I_insert on %1$I for insert
        with check (is_admin_of_site(site_id) or is_super_admin());
    $f$, t);

    execute format($f$
      create policy %1$I_update on %1$I for update
        using (is_admin_of_site(site_id) or is_super_admin())
        with check (is_admin_of_site(site_id) or is_super_admin());
    $f$, t);

    execute format($f$
      create policy %1$I_delete on %1$I for delete
        using (is_admin_of_site(site_id) or is_super_admin());
    $f$, t);
  end loop;
end $$;

-- site_equipe não tem flag própria de publicado (é só um grid, sem
-- rascunho por item) — segue o status do site, igual site_faq/site_planos
create policy site_equipe_select on site_equipe for select
  using (is_member_of_site(site_id) or is_super_admin() or is_site_publicado(site_id));
create policy site_equipe_insert on site_equipe for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_equipe_update on site_equipe for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_equipe_delete on site_equipe for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- authenticated/service_role herdam via default privileges (0004/0007).
-- anon precisa de SELECT pra renderizar as páginas públicas.
grant select on site_tratamentos, site_equipe, site_cursos_eventos to anon;
