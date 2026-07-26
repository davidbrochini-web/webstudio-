-- ============================================================
-- 0006_constraints_validacao.sql
--
-- ITEM 9 DA AUDITORIA: memberships.papel e tenants.plano aceitavam
-- qualquer string, sem validação no banco (só na aplicação, o que
-- não protege contra escrita direta via SQL/Management API).
-- subscriptions.status e tenants.status já tinham CHECK (0001) —
-- este arquivo completa a cobertura.
-- ============================================================

alter table memberships
  add constraint memberships_papel_check
  check (papel in ('owner', 'admin', 'operador'));

alter table tenants
  add constraint tenants_plano_check
  check (plano in ('trial', 'site', 'site+modulos', 'modulos'));
