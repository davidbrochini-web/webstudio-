-- ============================================================
-- 0009_site_content.sql
--
-- Conteúdo do site institucional por tenant. Os 7 arquétipos de
-- layout (components/layouts/*) continuam EXATAMENTE como estão —
-- eles só consomem um objeto `NicheConfig`. Esta migration guarda
-- esse conteúdo no banco, por tenant, em vez de hardcoded em
-- lib/templates.ts (que continua existindo só pras vitrines
-- estáticas em /modelos/[nicho]).
--
-- Fluxo: super-admin cria o site do tenant escolhendo um dos 7
-- templates (o conteúdo nasce copiado do demo daquele nicho) →
-- fica em /sandbox/[slug] → cliente edita pelo /app/site.
--
-- 1 site por tenant nesta fase (unique em tenant_id). Múltiplos
-- sites por tenant é possível no futuro, mas não é o caso de uso
-- de agora.
-- ============================================================

create type site_status as enum ('rascunho', 'publicado');

create table sites (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null unique references tenants(id) on delete cascade,

  slug               text not null unique,
  pagelayout         text not null check (pagelayout in (
                       'clinico', 'editorial', 'portfolio', 'urbano',
                       'performance', 'zen', 'acolhedor'
                     )),
  -- referencia o slug de um nicho em lib/templates.ts, de onde vêm
  -- as classes tailwind de cor (accent/solidBg) — evita guardar hex
  -- solto no banco, o que quebraria o build do Tailwind (ele só gera
  -- CSS pra classes que existem literalmente no código-fonte).
  accent_key         text not null,

  business_name      text not null,
  tagline            text not null default '',
  hero_title         text not null,
  hero_sub           text not null default '',
  cta_label          text not null default 'Fale conosco',
  whatsapp           text,              -- número do PRÓPRIO cliente (dígitos), ex: 5511999999999
  instagram_handle   text,

  status             site_status not null default 'rascunho',

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references auth.users(id),
  deleted_at         timestamptz
);

create trigger trg_sites_updated before update on sites
  for each row execute function set_updated_at();

-- ── conteúdo filho: serviços, depoimentos, fotos, posts do feed ──

create table site_servicos (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  icon        text not null default '✨',
  title       text not null,
  description text not null default '',
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create table site_depoimentos (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  nome        text not null,
  texto       text not null,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

-- Array ordenado de fotos (equivalente ao `photoIds[]` de hoje, mas
-- com URL completa em vez de ID do Unsplash — lib/photos.ts foi
-- ajustado pra aceitar as duas formas). Usado tanto pro hero quanto
-- pro ciclo de fotos do feed simulado.
create table site_fotos (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  url         text not null,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

-- Cartões do feed simulado (legenda + curtidas). A foto de cada
-- cartão vem do ciclo de site_fotos pelo índice — mesmo
-- comportamento de unsplashPhotoFrom() hoje.
create table site_posts (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  caption     text not null,
  likes       int not null default 0,
  ordem       int not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create trigger trg_site_servicos_updated before update on site_servicos
  for each row execute function set_updated_at();
create trigger trg_site_depoimentos_updated before update on site_depoimentos
  for each row execute function set_updated_at();
create trigger trg_site_fotos_updated before update on site_fotos
  for each row execute function set_updated_at();
create trigger trg_site_posts_updated before update on site_posts
  for each row execute function set_updated_at();

-- ── funções auxiliares de RLS pras tabelas filhas ──────────────
-- As tabelas filhas não têm tenant_id direto, só site_id — estas
-- funções resolvem is_member/is_admin através do site.

create or replace function is_member_of_site(p_site_id uuid) returns boolean as $$
  select exists (
    select 1 from sites s
    where s.id = p_site_id
      and is_member_of_tenant(s.tenant_id)
  );
$$ language sql stable security definer;

create or replace function is_admin_of_site(p_site_id uuid) returns boolean as $$
  select exists (
    select 1 from sites s
    where s.id = p_site_id
      and is_admin_of_tenant(s.tenant_id)
  );
$$ language sql stable security definer;

create or replace function is_site_publicado(p_site_id uuid) returns boolean as $$
  select exists (
    select 1 from sites s
    where s.id = p_site_id
      and s.status = 'publicado'
      and s.deleted_at is null
  );
$$ language sql stable security definer;

-- ── RLS ─────────────────────────────────────────────────────────
alter table sites            enable row level security;
alter table site_servicos    enable row level security;
alter table site_depoimentos enable row level security;
alter table site_fotos       enable row level security;
alter table site_posts       enable row level security;

-- sites: membro do tenant ou super-admin sempre veem; visitante
-- anônimo só vê se estiver publicado (site em /sandbox/[slug])
create policy sites_select on sites for select
  using (
    is_member_of_tenant(tenant_id) or is_super_admin()
    or (status = 'publicado' and deleted_at is null)
  );

create policy sites_insert on sites for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy sites_update on sites for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin())
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy sites_delete on sites for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

-- tabelas filhas: mesmo padrão, resolvido via site_id
do $$
declare
  t text;
begin
  foreach t in array array['site_servicos', 'site_depoimentos', 'site_fotos', 'site_posts']
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

-- ── grants ──────────────────────────────────────────────────────
-- authenticated e service_role já herdam automaticamente via
-- default privileges configurados em 0004/0007. Falta só `anon` —
-- visitante sem login precisa de SELECT pra ver /sandbox/[slug]
-- (a RLS acima garante que só vê o que está 'publicado').
grant usage on schema public to anon;

grant select on sites, site_servicos, site_depoimentos, site_fotos, site_posts
  to anon;

grant execute on function
  is_member_of_site(uuid), is_admin_of_site(uuid), is_site_publicado(uuid)
  to authenticated, service_role, anon;

-- Default privileges: garante que módulos futuros também deem
-- select pra anon quando fizer sentido (não é automático hoje,
-- 0004/0007 só cobrem authenticated/service_role). Fica registrado
-- aqui como lembrete: se um módulo futuro precisar ser público,
-- vai precisar de GRANT explícito pra anon como este.
