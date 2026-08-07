-- ============================================================
-- 0034_leads_omnidesign.sql
--
-- CRM interno da agência (Omnidesign) — TOTALMENTE separado dos
-- dados dos tenants/clientes. Não tem tenant_id, não referencia
-- site_leads, RLS restrita a super-admin. Isso é intencional:
-- David foi explícito que isso é só da agência e não pode
-- influenciar ou conflitar em nada com os clientes de Projeto
-- Especial ou do catálogo.
--
-- Uma única tabela, duas origens (campo `origem`):
--   'site'   → capturado automaticamente pelo formulário de
--              contato do omnidesign.com.br (insert público, anon)
--   'manual' → cadastrado à mão pelo David/equipe, prospecção
--              ativa de empresas a contatar (insert só super-admin)
--
-- Mesmo padrão de site_leads pra permitir insert anônimo (ver
-- 0017), mas com a `origem` travada por CHECK + RLS pra impedir
-- que o formulário público insira como 'manual'.
-- ============================================================

create table leads_omnidesign (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  contato text not null default '',
  mensagem text not null default '',
  segmento text,
  notas text,
  origem text not null,
  status text not null default 'novo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  deleted_at timestamptz
);

alter table leads_omnidesign add constraint leads_omnidesign_origem_valida
  check (origem in ('site', 'manual'));
alter table leads_omnidesign add constraint leads_omnidesign_status_valido
  check (status in ('novo', 'contatado', 'sem_interesse', 'convertido'));

comment on table leads_omnidesign is
  'CRM interno da agência (Omnidesign) — leads de quem contatou pelo site + prospecção manual. Isolado dos tenants, RLS só super-admin (exceto insert público com origem=site).';
comment on column leads_omnidesign.nome is 'Nome da pessoa (origem site) ou da empresa (origem manual).';
comment on column leads_omnidesign.mensagem is 'Mensagem escrita pelo visitante no formulário (origem site). Vazio em leads manuais.';
comment on column leads_omnidesign.notas is 'Anotações internas de acompanhamento (usado por qualquer origem, adicionado depois pelo David/equipe).';
comment on column leads_omnidesign.segmento is 'Nicho do negócio (ex: dentista, advocacia) — texto livre, relevante principalmente pra leads manuais.';

create trigger trg_leads_omnidesign_updated before update on leads_omnidesign
  for each row execute function set_updated_at();

alter table leads_omnidesign enable row level security;

-- Formulário público do site: só pode inserir como origem='site',
-- não escolhe status (fica no default 'novo') nem se marca como manual.
create policy leads_omnidesign_insert_site on leads_omnidesign
  for insert to anon
  with check (origem = 'site' and status = 'novo');

-- Prospecção manual: só super-admin, qualquer origem/status.
create policy leads_omnidesign_insert_admin on leads_omnidesign
  for insert to authenticated
  with check (is_super_admin());

create policy leads_omnidesign_select on leads_omnidesign
  for select using (is_super_admin());

create policy leads_omnidesign_update on leads_omnidesign
  for update using (is_super_admin());

-- Sem policy de delete: exclusão é sempre soft-delete via update
-- (deleted_at), mesmo padrão do resto da plataforma.

create index idx_leads_omnidesign_origem_status on leads_omnidesign(origem, status) where deleted_at is null;

-- authenticated/service_role herdam via default privileges (0004/0007).
-- anon precisa de INSERT explícito pro formulário público.
grant insert on leads_omnidesign to anon;
