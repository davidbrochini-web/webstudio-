-- ============================================================
-- 0002_cadastros.sql
-- Módulo de Cadastros: a base que todo outro módulo referencia.
-- Funcionários, Produtos/Serviços, Clientes e Fornecedores.
--
-- Cliente e Fornecedor têm colunas parecidas hoje, mas ficam em
-- tabelas separadas de propósito: cliente vai ganhar histórico de
-- compra e limite de crédito; fornecedor vai ganhar prazo de
-- entrega e condição de pagamento. Evoluções diferentes.
-- ============================================================

-- ── enums ────────────────────────────────────────────────────
create type pessoa_tipo as enum ('fisica', 'juridica');
create type registro_status as enum ('ativo', 'inativo');
create type produto_servico_tipo as enum ('produto', 'servico');

-- ── funcionários ─────────────────────────────────────────────
create table funcionarios (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,

  nome        text not null,
  cpf         text,
  cargo       text,
  admissao    date,
  telefone    text,
  email       text,
  status      registro_status not null default 'ativo',
  observacoes text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create trigger trg_funcionarios_updated before update on funcionarios
  for each row execute function set_updated_at();

-- ── produtos / serviços ──────────────────────────────────────
create table produtos_servicos (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,

  tipo        produto_servico_tipo not null default 'produto',
  nome        text not null,
  sku         text,               -- código interno; obrigatório só quando o módulo de estoque chegar
  preco       numeric(12,2),
  unidade     text default 'un',  -- un, kg, hora, m², etc.
  status      registro_status not null default 'ativo',
  observacoes text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  deleted_at  timestamptz
);

create trigger trg_produtos_servicos_updated before update on produtos_servicos
  for each row execute function set_updated_at();

-- ── clientes ─────────────────────────────────────────────────
create table clientes (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,

  tipo_pessoa    pessoa_tipo not null default 'juridica',
  nome           text not null,      -- razão social OU nome completo
  cpf_cnpj       text,
  telefone       text,
  email          text,
  endereco       jsonb,              -- {logradouro, numero, bairro, cidade, uf, cep}
  status         registro_status not null default 'ativo',
  observacoes    text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

create trigger trg_clientes_updated before update on clientes
  for each row execute function set_updated_at();

-- ── fornecedores ─────────────────────────────────────────────
create table fornecedores (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,

  tipo_pessoa    pessoa_tipo not null default 'juridica',
  nome           text not null,
  cpf_cnpj       text,
  telefone       text,
  email          text,
  endereco       jsonb,
  status         registro_status not null default 'ativo',
  observacoes    text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id),
  deleted_at     timestamptz
);

create trigger trg_fornecedores_updated before update on fornecedores
  for each row execute function set_updated_at();

-- ── índices de apoio (buscas mais comuns) ───────────────────────
create index idx_funcionarios_tenant on funcionarios(tenant_id) where deleted_at is null;
create index idx_produtos_servicos_tenant on produtos_servicos(tenant_id) where deleted_at is null;
create index idx_clientes_tenant on clientes(tenant_id) where deleted_at is null;
create index idx_fornecedores_tenant on fornecedores(tenant_id) where deleted_at is null;

create index idx_clientes_cpf_cnpj on clientes(tenant_id, cpf_cnpj);
create index idx_fornecedores_cpf_cnpj on fornecedores(tenant_id, cpf_cnpj);
