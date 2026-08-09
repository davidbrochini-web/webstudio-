-- ============================================================
-- 0039_projeto_especial_colegio_elite.sql
--
-- Projeto Especial #3 — Colégio Elite (ver PROJETOS_ESPECIAIS.md).
-- Mesmo espírito do dentista-joao (0021) e casos-esquecidos (0030):
-- pagelayout dedicado, reaproveita ao máximo o que já é genérico em
-- `sites` (hero_*, missao/visao/valores, textos_customizados,
-- cor_primaria/secundaria, logo_posicao, telefone/whatsapp/endereco,
-- secao_faq_visivel, secao_artigos_visivel) e site_faq/site_blog_posts/
-- site_leads (sem alteração — já servem como estão).
--
-- Duas tabelas novas, porque o domínio semântico (escola) não é
-- "tratamentos"/"cursos" — mas seguem exatamente o padrão de
-- site_equipe/site_cursos_eventos (site_id, RLS igual, sem exclusão
-- física, índice único parcial em slug já nascendo correto — lição
-- aprendida no bug 0032 do dentista-joao, aplicada de cara aqui).
-- ============================================================

alter table sites drop constraint sites_pagelayout_check;
alter table sites add constraint sites_pagelayout_check
  check (pagelayout = any (array[
    'clinico', 'editorial', 'portfolio', 'urbano', 'performance', 'zen', 'acolhedor',
    'dentista-joao', 'casos-esquecidos',
    'colegio-elite'  -- ★ pagelayout dedicado deste projeto especial
  ]));

-- Flags de visibilidade próprias (mais claro pra manutenção futura do
-- que reaproveitar secao_tratamentos_visivel/secao_cursos_visivel com
-- nome que não bate com o domínio de uma escola).
alter table sites
  add column secao_diferenciais_visivel boolean not null default true,
  add column secao_segmentos_visivel    boolean not null default true;

-- "Diferenciais" (Atendimento qualificado, Professores especializados,
-- Sala Multimídia, Laboratório, Espaço Natureza...) — grid simples,
-- sem página de detalhe própria, mesmo padrão de site_equipe (sem
-- flag "publicado" por item, sem slug).
create table site_diferenciais (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  icone       text,               -- emoji ou nome de ícone simples
  titulo      text not null,
  texto       text not null default '',
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

-- "Segmentos de Ensino" (Bilíngue/English Stars, Fundamental I e II,
-- Médio) — cada um com página própria (/ensino/[slug]), mesmo padrão
-- de site_cursos_eventos: slug + publicado + SEO próprio. Índice único
-- parcial de slug já nasce soft-delete aware (lição do bug 0032).
create table site_segmentos_ensino (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references sites(id) on delete cascade,
  slug              text not null,
  titulo            text not null,
  resumo            text not null default '',      -- card na Home/listagem
  texto_completo    text not null default '',       -- página de detalhe
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
  deleted_at        timestamptz
);

create unique index site_segmentos_ensino_site_slug_key
  on site_segmentos_ensino (site_id, slug) where deleted_at is null;

create trigger trg_site_diferenciais_updated before update on site_diferenciais
  for each row execute function set_updated_at();
create trigger trg_site_segmentos_ensino_updated before update on site_segmentos_ensino
  for each row execute function set_updated_at();

alter table site_diferenciais    enable row level security;
alter table site_segmentos_ensino enable row level security;

-- site_diferenciais: sem flag própria de publicado, segue status do
-- site (mesmo padrão de site_equipe).
create policy site_diferenciais_select on site_diferenciais for select
  using (is_member_of_site(site_id) or is_super_admin() or is_site_publicado(site_id));
create policy site_diferenciais_insert on site_diferenciais for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_diferenciais_update on site_diferenciais for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_diferenciais_delete on site_diferenciais for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- site_segmentos_ensino: publicado=true + site publicado pro público
-- (mesmo padrão de site_tratamentos/site_cursos_eventos).
create policy site_segmentos_ensino_select on site_segmentos_ensino for select
  using (
    is_member_of_site(site_id) or is_super_admin()
    or (is_site_publicado(site_id) and publicado = true)
  );
create policy site_segmentos_ensino_insert on site_segmentos_ensino for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_segmentos_ensino_update on site_segmentos_ensino for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_segmentos_ensino_delete on site_segmentos_ensino for delete
  using (is_admin_of_site(site_id) or is_super_admin());

grant select on site_diferenciais, site_segmentos_ensino to anon;
