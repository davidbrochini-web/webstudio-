-- ============================================================
-- 0059_log_evento_demo_criada.sql
--
-- Novo evento pro log do lead: 'demo_criada'. Registrado quando o
-- atendente cria uma demo pra esse lead (ver criarDemoParaLead em
-- app/admin/crm/actions.ts, migration 0058 pro modelo de dados).
-- ============================================================

alter table leads_omnidesign_log drop constraint leads_omnidesign_log_evento_valido;
alter table leads_omnidesign_log add constraint leads_omnidesign_log_evento_valido
  check (evento in ('lead_criado', 'status_alterado', 'proposta_gerada', 'responsavel_alterado', 'demo_criada'));
