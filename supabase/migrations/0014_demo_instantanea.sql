-- ============================================================
-- 0014_demo_instantanea.sql
--
-- Suporte à demo instantânea (sem login/senha, via Supabase Auth
-- anônimo): visitante clica "testar agora" no site público, escolhe
-- um nicho, e cai direto no /app/editor com um tenant só dele,
-- isolado dos outros visitantes.
--
-- is_demo marca esses tenants pra:
-- 1. Não aparecerem misturados na lista principal do admin
-- 2. Poderem ser limpos periodicamente (não têm valor de negócio
--    depois de um tempo — não há job automático ainda, limpeza é
--    manual por enquanto)
-- ============================================================

alter table tenants add column if not exists is_demo boolean not null default false;

create index if not exists idx_tenants_is_demo on tenants(is_demo) where is_demo = true;

-- Captura opcional de contato de quem gostou da demo. Sem RLS
-- restritiva de leitura pro próprio visitante (ele nunca precisa ler
-- de volta) — só insere. Leitura é só do super-admin.
create table demo_leads (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete set null,
  nome        text not null,
  contato     text not null,
  created_at  timestamptz not null default now()
);

alter table demo_leads enable row level security;

create policy demo_leads_insert on demo_leads for insert
  with check (true);

create policy demo_leads_select on demo_leads for select
  using (is_super_admin());

grant select, insert on demo_leads to authenticated, anon;
