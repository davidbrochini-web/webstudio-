-- ============================================================
-- 0001_core_platform.sql
-- Núcleo multi-tenant: tenants, membros, assinaturas de módulo.
-- Toda tabela de módulo (cadastros, financeiro, etc) referencia
-- tenants(id) e é isolada por RLS usando is_member_of_tenant().
-- ============================================================

create extension if not exists "pgcrypto";

-- auth.users e auth.uid() são fornecidos pelo Supabase em produção.
-- Só existem aqui para permitir testar a migration localmente.
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null
);
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ language sql stable;

-- ── tenants ───────────────────────────────────────────────────
create table tenants (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  cnpj       text,
  plano      text not null default 'trial',
  status     text not null default 'ativo' check (status in ('ativo','suspenso','cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz
);

-- ── profiles: extensão de auth.users com dados da plataforma ──
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  nome           text,
  is_super_admin boolean not null default false, -- true SOMENTE para o dono da agência
  created_at     timestamptz not null default now()
);

-- ── memberships: liga usuário a tenant + papel ─────────────────
create type membership_role as enum ('owner', 'admin', 'operador');

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  papel      membership_role not null default 'operador',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (tenant_id, user_id)
);

-- ── subscriptions: quais módulos cada tenant assina ─────────────
create table subscriptions (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  modulo     text not null,  -- 'site' | 'cadastros' | 'contas_pagar' | 'estoque' | ...
  status     text not null default 'ativo' check (status in ('ativo','pausado','cancelado')),
  ativado_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  unique (tenant_id, modulo)
);

-- ── função central de RLS: usuário é membro do tenant? ──────────
create or replace function is_member_of_tenant(t_id uuid) returns boolean as $$
  select exists (
    select 1 from memberships
    where tenant_id = t_id and user_id = auth.uid()
  );
$$ language sql stable security definer;

-- ── função central de RLS: usuário é o super-admin (dono da agência)? ──
create or replace function is_super_admin() returns boolean as $$
  select coalesce(
    (select is_super_admin from profiles where id = auth.uid()),
    false
  );
$$ language sql stable security definer;

-- ── trigger genérica de updated_at ──────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated before update on tenants
  for each row execute function set_updated_at();

create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table tenants enable row level security;
alter table memberships enable row level security;
alter table subscriptions enable row level security;
alter table profiles enable row level security;

create policy tenants_select on tenants for select
  using (is_member_of_tenant(id) or is_super_admin());

create policy tenants_all_super_admin on tenants for all
  using (is_super_admin());

create policy memberships_select on memberships for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy subscriptions_select on subscriptions for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy subscriptions_all_super_admin on subscriptions for all
  using (is_super_admin());

create policy profiles_select_own on profiles for select
  using (id = auth.uid() or is_super_admin());

create policy profiles_update_own on profiles for update
  using (id = auth.uid());

create index idx_memberships_user on memberships(user_id);
create index idx_memberships_tenant on memberships(tenant_id);
create index idx_subscriptions_tenant on subscriptions(tenant_id);
