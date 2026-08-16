-- ============================================================
-- 0064_crm_qualificacao_resposta.sql
--
-- Checklist de qualificação (aba Análise) só tinha status
-- (pendente/detectado/confirmado/não se aplica) — sem lugar pra
-- anotar O QUE o cliente respondeu de verdade. Também serve pra
-- registrar resposta que veio por áudio (a atendente ouve e digita
-- aqui — sem transcrição automática, que bateria de frente com o
-- princípio Zero IA do CRM).
-- ============================================================

alter table crm_qualificacao add column if not exists resposta text;

comment on column crm_qualificacao.resposta is
  'Texto livre com o que o cliente respondeu pra esse item — preenchido manualmente pelo atendente, inclusive quando a resposta veio por áudio (sem transcrição automática).';
