-- ============================================================
-- 0060_demo_purge_via_http.sql
--
-- Corrige um bug real da migration 0058: o purge automático rodava
-- como SQL puro via pg_cron (purgar_demos_soft_deletadas()), que
-- apaga o tenant (cascade cuida das tabelas) mas NÃO limpa o
-- usuário anônimo do Supabase Auth vinculado à membership — SQL
-- puro não tem acesso à Auth Admin API. Isso ia acumular contas
-- órfãs em auth.users pra sempre a cada purge automático.
--
-- O botão manual de apagar demo (app/admin/tenants/demos/actions.ts)
-- já fazia essa limpeza dupla (tenant + auth.users) desde antes —
-- só o caminho automático novo que ficou incompleto.
--
-- Fix: troca o job por uma chamada HTTP (mesmo padrão já usado por
-- crm-escalonamento-email) pro endpoint /api/cron/demo-purge, que
-- roda com o client admin (service_role) e cuida dos dois.
-- ============================================================

SELECT cron.unschedule('demo-purge-soft-deletadas');

DROP FUNCTION IF EXISTS purgar_demos_soft_deletadas();

SELECT cron.schedule(
  'demo-purge-soft-deletadas',
  '0 4 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/demo-purge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);
