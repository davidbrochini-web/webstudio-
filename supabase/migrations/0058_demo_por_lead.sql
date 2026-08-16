-- ============================================================
-- 0058_demo_por_lead.sql
--
-- Substitui o modelo de demo self-serve (/demo/iniciar público,
-- anônimo, sem limite) por demo criada pelo atendente durante a
-- negociação com um lead do CRM interno (leads_omnidesign).
--
-- Motivação: 45 tenants demo criados em 9 dias pelo fluxo público,
-- 0 leads capturados (demo_leads) — nenhuma conversão real, só
-- custo (métrica poluída, superfície de abuso). Decisão do David:
-- matar o self-serve, demo nasce ligada a um lead específico e
-- morre com ele quando o lead é perdido.
--
-- lead_id: liga o tenant demo ao lead que o originou. ON DELETE
-- SET NULL (não CASCADE) — se um dia leads_omnidesign for
-- hard-deletado por outro motivo, o tenant não deve sumir junto
-- sem passar pelo fluxo de soft-delete/purge abaixo.
--
-- demo_token: token opaco pro link que o atendente manda pro lead
-- (/demo/entrar?token=...). Gerado na criação, só demos têm.
-- ============================================================

alter table tenants add column if not exists lead_id uuid references leads_omnidesign(id) on delete set null;
alter table tenants add column if not exists demo_token uuid unique;

create index if not exists idx_tenants_lead_id on tenants(lead_id) where lead_id is not null;
create index if not exists idx_tenants_demo_token on tenants(demo_token) where demo_token is not null;

comment on column tenants.lead_id is 'Lead do CRM (leads_omnidesign) que originou esta demo. Só preenchido quando is_demo=true.';
comment on column tenants.demo_token is 'Token do link de acesso à demo (/demo/entrar?token=...). Só preenchido quando is_demo=true.';

-- ============================================================
-- Trigger: lead marcado como perdido → soft-delete da(s) demo(s)
-- ligada(s) a ele. Soft-delete (não apaga de vez) porque status
-- pode ser trocado por engano — o purge definitivo roda depois de
-- alguns dias via cron, dando margem pra reverter.
-- ============================================================
create or replace function demo_soft_delete_ao_perder_lead() returns trigger as $$
begin
  if new.status = 'perdido' and old.status is distinct from 'perdido' then
    update tenants
       set deleted_at = now()
     where lead_id = new.id
       and is_demo = true
       and deleted_at is null;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_demo_soft_delete_ao_perder_lead on leads_omnidesign;
create trigger trg_demo_soft_delete_ao_perder_lead
  after update on leads_omnidesign
  for each row execute function demo_soft_delete_ao_perder_lead();

-- ============================================================
-- pg_cron: purge definitivo de demos soft-deletadas há mais de 7
-- dias (cascade cuida de sites/memberships/subscriptions/cadastros;
-- demo_leads.tenant_id é ON DELETE SET NULL, preserva o contato).
-- ============================================================
create or replace function purgar_demos_soft_deletadas() returns void as $$
begin
  delete from tenants
   where is_demo = true
     and deleted_at is not null
     and deleted_at < now() - interval '7 days';
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

select cron.schedule(
  'demo-purge-soft-deletadas',
  '0 4 * * *',
  $cron$ SELECT purgar_demos_soft_deletadas(); $cron$
);

-- ============================================================
-- Limpeza única: as 45 demos órfãs do fluxo público antigo (sem
-- lead_id, criadas antes desta migration) somem agora, direto —
-- não fazem sentido no novo modelo, não há lead pra "perder".
-- ============================================================
delete from tenants where is_demo = true and lead_id is null;
