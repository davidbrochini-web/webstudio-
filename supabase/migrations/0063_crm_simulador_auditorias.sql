-- ============================================================
-- 0063_crm_simulador_auditorias.sql
--
-- Botão "Auditoria de simulação" no LeadWhatsappSimulador: a Eliane
-- (ou qualquer atendente treinando) sinaliza um problema que
-- encontrou no cliente automático — o roteiro travou, respondeu
-- errado, ignorou a pergunta etc. — junto com uma sugestão de
-- solução. Fica registrado com o snapshot da conversa inteira até
-- aquele ponto, pra virar pendência de melhoria da lógica
-- (lib/crm-simulador-roteiros.ts) depois, sem depender de lembrar
-- ou printar tela.
-- ============================================================

create table if not exists crm_simulador_auditorias (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads_omnidesign(id) on delete cascade,
  perfil_simulado text not null,
  problema text not null,
  solucao_sugerida text,
  conversa_snapshot jsonb not null,
  status text not null default 'pendente' check (status in ('pendente', 'resolvido')),
  criado_por uuid references profiles(id),
  created_at timestamptz not null default now(),
  resolvido_em timestamptz
);

create index if not exists idx_crm_simulador_auditorias_status on crm_simulador_auditorias(status, created_at desc);
create index if not exists idx_crm_simulador_auditorias_lead on crm_simulador_auditorias(lead_id);

alter table crm_simulador_auditorias enable row level security;

create policy "super_admin_all_simulador_auditorias" on crm_simulador_auditorias
  for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_super_admin = true))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_super_admin = true));

comment on table crm_simulador_auditorias is
  'Fila de problemas reportados no simulador de WhatsApp do CRM (roteiro travando, resposta errada etc.) — cada registro guarda o snapshot da conversa até o momento do report, pra virar pendência de melhoria em lib/crm-simulador-roteiros.ts.';
