-- 0045: Blog institucional da própria Omnidesign (não confundir com
-- site_blog_posts, que é o blog genérico preso a site_id/tenant dos
-- clientes do catálogo e projetos especiais). O site omnidesign.com.br
-- é 100% estático (sem linha em `sites`), então este blog vive numa
-- tabela própria, no mesmo espírito de leads_omnidesign — dado da
-- agência, não de tenant.
--
-- Agendamento sem cron: não existe uma coluna "agendado" separada.
-- `status = 'publicado'` + `publicado_em` no futuro = fica escondido
-- até a data chegar (filtro na query pública). O admin só decide
-- rascunho vs. publicado; "agendado" é um estado computado (publicado
-- + data futura), exibido só na UI do painel.

create table if not exists blog_posts_omnidesign (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  titulo text not null,
  resumo text not null default '',
  conteudo text not null default '',
  categoria text,
  capa_url text,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  publicado_em timestamptz,
  meta_titulo text,
  meta_descricao text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Lição aprendida no Dentista João: UNIQUE simples não exclui
-- soft-delete e trava slugs de posts apagados pra sempre.
create unique index if not exists blog_posts_omnidesign_slug_idx
  on blog_posts_omnidesign (slug) where deleted_at is null;

create index if not exists blog_posts_omnidesign_publicado_idx
  on blog_posts_omnidesign (publicado_em desc) where status = 'publicado' and deleted_at is null;

create or replace function set_updated_at_blog_omnidesign()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_omnidesign_updated_at on blog_posts_omnidesign;
create trigger blog_posts_omnidesign_updated_at
  before update on blog_posts_omnidesign
  for each row execute function set_updated_at_blog_omnidesign();

alter table blog_posts_omnidesign enable row level security;

-- Leitura pública: só post publicado E com data de publicação já
-- passada (é isso que faz o agendamento funcionar sem cron).
drop policy if exists blog_posts_omnidesign_select_public on blog_posts_omnidesign;
create policy blog_posts_omnidesign_select_public on blog_posts_omnidesign
  for select to anon, authenticated
  using (
    deleted_at is null
    and status = 'publicado'
    and publicado_em is not null
    and publicado_em <= now()
  );

-- CRUD completo só super_admin (helper SECURITY DEFINER já existente
-- desde 0001 — nunca EXISTS/JOIN direto em profiles numa policy lida
-- por anon).
drop policy if exists blog_posts_omnidesign_all_admin on blog_posts_omnidesign;
create policy blog_posts_omnidesign_all_admin on blog_posts_omnidesign
  for all to authenticated
  using (is_super_admin())
  with check (is_super_admin());

grant select on blog_posts_omnidesign to anon, authenticated;
grant insert, update, delete on blog_posts_omnidesign to authenticated;
