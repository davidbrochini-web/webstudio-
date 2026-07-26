-- ============================================================
-- 0015_plano_demo.sql
--
-- A demo instantanea cria tenants com plano='demo', mas a constraint
-- de tenants.plano so aceitava trial/site/site+modulos/modulos.
-- Achado testando o fluxo manualmente antes de mergear (por isso
-- nao quebrou em producao - nunca tinha rodado de verdade ainda).
-- ============================================================

alter table tenants drop constraint tenants_plano_check;
alter table tenants add constraint tenants_plano_check
  check (plano = any (array['trial', 'site', 'site+modulos', 'modulos', 'demo']));
