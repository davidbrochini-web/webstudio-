-- ============================================================
-- 0041_leads_faq.sql
--
-- FAQ por lead no CRM interno (leads_omnidesign). Duas origens
-- por linha (campo `tipo`):
--   'pre_definida'   → gerada previamente por segmento (script pronto
--                      pra Andressa usar, editável)
--   'pergunta_aberta' → pergunta real que o cliente fez, digitada
--                      pela Andressa, com resposta registrada depois
--
-- Mesmo padrão de isolamento do CRM (0034): sem tenant_id, RLS só
-- super-admin, nada disso é visível/relacionado a cliente final.
-- ============================================================

create table leads_omnidesign_faq (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads_omnidesign(id) on delete cascade,
  tipo text not null,
  pergunta text not null,
  resposta text not null,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

alter table leads_omnidesign_faq add constraint leads_omnidesign_faq_tipo_valido
  check (tipo in ('pre_definida', 'pergunta_aberta'));

comment on table leads_omnidesign_faq is
  'FAQ por lead do CRM interno — perguntas pré-definidas por segmento + perguntas reais registradas pelo comercial, cada uma com resposta.';
comment on column leads_omnidesign_faq.tipo is
  'pre_definida = script padrão do segmento; pergunta_aberta = pergunta real do cliente, registrada pela Andressa.';
comment on column leads_omnidesign_faq.ordem is
  'Ordem de exibição dentro do mesmo tipo (menor primeiro).';

create trigger trg_leads_omnidesign_faq_updated before update on leads_omnidesign_faq
  for each row execute function set_updated_at();

alter table leads_omnidesign_faq enable row level security;

create policy leads_omnidesign_faq_select on leads_omnidesign_faq
  for select using (is_super_admin());

create policy leads_omnidesign_faq_insert on leads_omnidesign_faq
  for insert to authenticated
  with check (is_super_admin());

create policy leads_omnidesign_faq_update on leads_omnidesign_faq
  for update using (is_super_admin());

create policy leads_omnidesign_faq_delete on leads_omnidesign_faq
  for delete using (is_super_admin());

create index idx_leads_omnidesign_faq_lead on leads_omnidesign_faq(lead_id, tipo, ordem);

-- authenticated/service_role herdam via default privileges (0004/0007).
