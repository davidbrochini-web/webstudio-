-- ============================================================
-- 0019_modulo_financeiro.sql
--
-- Módulo Financeiro = Contas a Pagar + Contas a Receber + Fluxo de
-- Caixa num único módulo contratável (decisão de produto: eram 3
-- módulos separados no catálogo, viraram 1 — Fluxo de Caixa é só um
-- dashboard que soma os outros dois, não faz sentido cobrar 3x).
--
-- 1. Ajusta subscriptions.modulo pro catálogo final: remove os 3
--    slugs antigos (contas-pagar/contas-receber/fluxo-caixa) e
--    adiciona `financeiro` (1 módulo) + `whatsapp` (módulo à parte
--    do CRM, não incluso nele — decisão de produto).
-- 2. Cria contas_pagar / contas_receber — mesmo padrão de auditoria
--    e RLS das tabelas de Cadastros (0002/0003).
-- ============================================================

-- 1) catálogo de módulos
alter table subscriptions drop constraint subscriptions_modulo_check;
alter table subscriptions add constraint subscriptions_modulo_check
  check (modulo = any (array[
    'site',
    'cadastros',
    'crm',
    'whatsapp',
    'estoque',
    'financeiro',
    'pedidos-internos',
    'agendamento',
    'videos'
  ]));

-- 2) tabelas
create table contas_pagar (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  fornecedor_id  uuid references fornecedores(id) on delete set null,
  descricao      text not null,
  categoria      text,
  valor          numeric(12,2) not null check (valor >= 0),
  vencimento     date not null,
  data_pagamento date,
  status         text not null default 'pendente' check (status in ('pendente', 'pago')),
  observacoes    text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

create table contas_receber (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  cliente_id     uuid references clientes(id) on delete set null,
  descricao      text not null,
  categoria      text,
  valor          numeric(12,2) not null check (valor >= 0),
  vencimento     date not null,
  data_recebimento date,
  status         text not null default 'pendente' check (status in ('pendente', 'recebido')),
  observacoes    text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

create index idx_contas_pagar_tenant on contas_pagar(tenant_id) where deleted_at is null;
create index idx_contas_receber_tenant on contas_receber(tenant_id) where deleted_at is null;

create trigger trg_contas_pagar_updated before update on contas_pagar
  for each row execute function set_updated_at();
create trigger trg_contas_receber_updated before update on contas_receber
  for each row execute function set_updated_at();

-- ── RLS — mesmo padrão de funcionarios/clientes/fornecedores ────
alter table contas_pagar enable row level security;
alter table contas_receber enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['contas_pagar', 'contas_receber']
  loop
    execute format($f$
      create policy %1$I_select on %1$I for select
        using (is_member_of_tenant(tenant_id) or is_super_admin());
    $f$, t);

    execute format($f$
      create policy %1$I_insert on %1$I for insert
        with check (is_admin_of_tenant(tenant_id) or is_super_admin());
    $f$, t);

    execute format($f$
      create policy %1$I_update on %1$I for update
        using (is_admin_of_tenant(tenant_id) or is_super_admin())
        with check (is_admin_of_tenant(tenant_id) or is_super_admin());
    $f$, t);

    execute format($f$
      create policy %1$I_delete on %1$I for delete
        using (is_admin_of_tenant(tenant_id) or is_super_admin());
    $f$, t);
  end loop;
end $$;

-- authenticated/service_role herdam via default privileges (0004/0007).
-- Sem grant pra anon — módulo interno, nunca público.
