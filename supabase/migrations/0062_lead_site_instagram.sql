-- ============================================================
-- 0062_lead_site_instagram.sql
--
-- Novo botão "Editar cliente" no atendimento do lead — precisa de
-- dois campos que ainda não existiam: site atual (se já tem um) e
-- link do Instagram, além de poder editar tudo que já existia
-- (nome, telefone, email, segmento, bairro, endereço, notas).
-- ============================================================

alter table leads_omnidesign add column if not exists site_atual_url text;
alter table leads_omnidesign add column if not exists instagram_url text;

comment on column leads_omnidesign.site_atual_url is
  'Site atual do lead, se já tiver um (informativo, pra diagnóstico/proposta) — preenchido pelo atendente via "Editar cliente".';
comment on column leads_omnidesign.instagram_url is
  'Link/handle do Instagram do lead — preenchido pelo atendente via "Editar cliente".';
