-- ============================================================
-- 0018_catalogo_modulos.sql
--
-- Catálogo canônico de módulos, travado por CHECK. Antes,
-- subscriptions.modulo era texto livre — um typo no admin criaria
-- um "módulo fantasma" que nenhuma tela reconhece. Como o catálogo
-- completo acabou de ser definido no site (seção Módulos da landing),
-- travamos os slugs aqui de uma vez, ANTES de começar o
-- desenvolvimento dos módulos — mesma filosofia da CHECK de
-- tenants.plano.
--
-- Slugs (1:1 com components/sections/Modules.tsx +
-- components/admin/TenantModulesManager.tsx):
--   site             → Site + Instagram (produto base)
--   cadastros        → Cadastros (único módulo interno pronto hoje)
--   crm              → CRM
--   estoque          → Controle de Estoque
--   contas-pagar     → Contas a Pagar
--   contas-receber   → Contas a Receber
--   fluxo-caixa      → Fluxo de Caixa
--   pedidos-internos → Pedidos Internos
--   agendamento      → Agendamento (pendência registrada)
--   videos           → Vídeos no Site (pendência registrada)
--
-- Dados atuais em produção: só 'site' e 'cadastros' — nada viola.
-- ============================================================

alter table subscriptions add constraint subscriptions_modulo_check
  check (modulo = any (array[
    'site',
    'cadastros',
    'crm',
    'estoque',
    'contas-pagar',
    'contas-receber',
    'fluxo-caixa',
    'pedidos-internos',
    'agendamento',
    'videos'
  ]));
