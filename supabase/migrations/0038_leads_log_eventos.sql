-- ============================================================
-- 0038_leads_log_eventos.sql
--
-- Pedido do David: saber quando cada coisa aconteceu com um lead
-- (cadastro, mudança de status, geração de proposta) — não só a
-- data mais recente, um histórico completo por lead.
--
-- Duas peças:
-- 1) leads_omnidesign_log: tabela de eventos, cresce com o tempo,
--    nunca é editada/apagada (é log de verdade).
-- 2) proposta_gerada_em: campo de acesso rápido em leads_omnidesign
--    (evita ter que consultar o log só pra saber "tem proposta ou
--    não" na listagem — o log continua sendo a fonte completa).
-- ============================================================

alter table leads_omnidesign add column proposta_gerada_em timestamptz;
comment on column leads_omnidesign.proposta_gerada_em is 'Data/hora da última geração automática de proposta (via botão Gerar Proposta) — null se nunca gerou ou só fez upload manual.';

create table leads_omnidesign_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads_omnidesign(id) on delete cascade,
  evento text not null,
  status_anterior text,
  status_novo text,
  detalhe text,
  criado_em timestamptz not null default now(),
  criado_por uuid references profiles(id)
);

alter table leads_omnidesign_log add constraint leads_omnidesign_log_evento_valido
  check (evento in ('lead_criado', 'status_alterado', 'proposta_gerada', 'responsavel_alterado'));

comment on table leads_omnidesign_log is 'Histórico de eventos de um lead (cadastro, mudança de status, geração de proposta, troca de responsável) — nunca editado nem apagado, é log de verdade.';
comment on column leads_omnidesign_log.detalhe is 'Texto livre extra, ex: nome do novo responsável quando evento=responsavel_alterado.';

alter table leads_omnidesign_log enable row level security;

create policy leads_omnidesign_log_select on leads_omnidesign_log
  for select using (is_super_admin());

create policy leads_omnidesign_log_insert on leads_omnidesign_log
  for insert to authenticated
  with check (is_super_admin());

-- Sem update/delete: log é append-only por design.

create index idx_leads_omnidesign_log_lead on leads_omnidesign_log(lead_id, criado_em desc);
