-- ============================================================
-- 0020_modulo_estoque.sql
--
-- Módulo Controle de Estoque: entrada/saída de produtos com saldo
-- calculado (soma dos movimentos, sem coluna denormalizada — mesmo
-- espírito do Fluxo de Caixa: a "verdade" é o ledger de
-- movimentações, o saldo é derivado na consulta) + alerta de
-- estoque mínimo por produto.
--
-- Só se aplica a produtos_servicos.tipo = 'produto' — serviço não
-- tem estoque. Isso é filtrado na aplicação, não travado aqui: nada
-- impede tecnicamente registrar movimento de um "serviço" cadastrado
-- errado, e travar isso na FK adicionaria complexidade sem
-- necessidade real (o formulário só lista produtos).
-- ============================================================

alter table produtos_servicos
  add column estoque_minimo integer check (estoque_minimo >= 0);

create table estoque_movimentacoes (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  produto_id   uuid not null references produtos_servicos(id) on delete cascade,
  tipo         text not null check (tipo in ('entrada', 'saida')),
  quantidade   integer not null check (quantidade > 0),
  motivo       text,
  data         date not null default current_date,
  observacoes  text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id),
  deleted_at   timestamptz
);

create index idx_estoque_mov_tenant on estoque_movimentacoes(tenant_id) where deleted_at is null;
create index idx_estoque_mov_produto on estoque_movimentacoes(produto_id) where deleted_at is null;

create trigger trg_estoque_mov_updated before update on estoque_movimentacoes
  for each row execute function set_updated_at();

alter table estoque_movimentacoes enable row level security;

-- mesmo padrão de contas_pagar/contas_receber (0019)
create policy estoque_movimentacoes_select on estoque_movimentacoes for select
  using (is_member_of_tenant(tenant_id) or is_super_admin());

create policy estoque_movimentacoes_insert on estoque_movimentacoes for insert
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy estoque_movimentacoes_update on estoque_movimentacoes for update
  using (is_admin_of_tenant(tenant_id) or is_super_admin())
  with check (is_admin_of_tenant(tenant_id) or is_super_admin());

create policy estoque_movimentacoes_delete on estoque_movimentacoes for delete
  using (is_admin_of_tenant(tenant_id) or is_super_admin());

-- authenticated/service_role herdam via default privileges (0004/0007).
-- Sem grant anon — módulo interno.
