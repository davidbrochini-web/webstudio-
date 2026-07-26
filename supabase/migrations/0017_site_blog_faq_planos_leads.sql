-- ============================================================
-- 0017_site_blog_faq_planos_leads.sql
--
-- Retrabalho dos 9 templates de nicho: todo site (demo ou de
-- cliente real) passa a ter, além do que já existia:
--
-- 1. site_blog_posts — área de blog (bom pra SEO). Autoria pelo
--    painel do cliente é o próximo passo (fora desta migration);
--    aqui só o modelo de dados + leitura pública dos publicados.
-- 2. site_faq — perguntas frequentes, obrigatório em todos os
--    templates agora.
-- 3. site_planos — tabela de preços/planos (exibição estática,
--    SEM sistema de assinatura/cobrança — isso é pendência de
--    módulo futuro).
-- 4. site_leads — formulário de contato do site (obrigatório em
--    todos os templates). Visitante insere, só admin do site (ou
--    super-admin) lê — mesmo espírito de demo_leads, mas por site
--    real em vez de só demo.
--
-- Segue exatamente o padrão de 0009: tabelas filhas por site_id,
-- RLS via is_member_of_site/is_admin_of_site/is_site_publicado,
-- anon com SELECT explícito no que é público.
-- ============================================================

create table site_blog_posts (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  slug        text not null,
  titulo      text not null,
  resumo      text not null default '',
  conteudo    text not null default '',
  capa_url    text,
  publicado   boolean not null default true,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz,

  unique (site_id, slug)
);

create table site_faq (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  pergunta    text not null,
  resposta    text not null,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

-- Exibição estática de plano/preço. Sem coluna de cobrança —
-- "assinatura" de verdade (checkout, recorrência) é módulo futuro,
-- combinado explicitamente com o David.
create table site_planos (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  nome        text not null,
  preco       text not null,
  periodo     text,                        -- ex: "/mês", "por sessão"
  destaque    boolean not null default false,
  features    text[] not null default '{}',
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

-- Formulário de contato do site (distinto de demo_leads, que é só
-- da demo instantânea). Sem updated_at/created_by — é write-once
-- do visitante, nunca editado depois.
create table site_leads (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  nome        text not null,
  contato     text not null,
  mensagem    text not null default '',
  created_at  timestamptz not null default now()
);

create trigger trg_site_blog_posts_updated before update on site_blog_posts
  for each row execute function set_updated_at();
create trigger trg_site_faq_updated before update on site_faq
  for each row execute function set_updated_at();
create trigger trg_site_planos_updated before update on site_planos
  for each row execute function set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────
alter table site_blog_posts enable row level security;
alter table site_faq        enable row level security;
alter table site_planos     enable row level security;
alter table site_leads      enable row level security;

-- blog: publicado só aparece pro público quando o SITE está
-- publicado E o POST está marcado publicado=true. Membro/admin do
-- site e super-admin sempre veem tudo (rascunho de post incluso).
create policy site_blog_posts_select on site_blog_posts for select
  using (
    is_member_of_site(site_id) or is_super_admin()
    or (is_site_publicado(site_id) and publicado = true)
  );

create policy site_blog_posts_insert on site_blog_posts for insert
  with check (is_admin_of_site(site_id) or is_super_admin());

create policy site_blog_posts_update on site_blog_posts for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());

create policy site_blog_posts_delete on site_blog_posts for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- faq/planos: mesmo padrão de site_servicos (sem flag própria de
-- publicado — segue o status do site).
do $$
declare
  t text;
begin
  foreach t in array array['site_faq', 'site_planos']
  loop
    execute format($f$
      create policy %1$I_select on %1$I for select
        using (
          is_member_of_site(site_id) or is_super_admin()
          or is_site_publicado(site_id)
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

-- leads: qualquer um insere (formulário público do site); só
-- admin do site ou super-admin lê. Sem update/delete pra ninguém
-- via API por enquanto (limpeza, se precisar, é via super-admin
-- direto no banco/painel futuro).
create policy site_leads_insert on site_leads for insert
  with check (true);

create policy site_leads_select on site_leads for select
  using (is_admin_of_site(site_id) or is_super_admin());

-- ── grants ──────────────────────────────────────────────────────
-- authenticated/service_role herdam via default privileges
-- (0004/0007). anon precisa de SELECT no que é público (blog/faq/
-- planos) e INSERT em site_leads (formulário).
grant select on site_blog_posts, site_faq, site_planos to anon;
grant insert on site_leads to anon;
