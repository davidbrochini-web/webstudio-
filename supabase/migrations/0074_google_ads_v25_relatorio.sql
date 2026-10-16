-- 0074 — Google Ads API v25 + relatório por e-mail do Dr. João (16/10/2026)

-- 1) O Google bloqueou a v22 em 16/10/2026. O código agora usa a maior
--    entre a constante (v25) e esta coluna; atualizamos pra ficar coerente.
UPDATE google_ads_acessos SET api_version = 'v25', updated_at = now()
WHERE api_version IS DISTINCT FROM 'v25';

-- 2) Relatório único hoje às 20h BRT (23:00 UTC).
--    LIÇÃO 06-07/10: job único NÃO pode se desagendar no próprio comando
--    (o pg_cron cancela o job e a transação aborta junto com o http_post).
--    A limpeza fica num job separado, 10 min depois.
SELECT cron.schedule(
  'relatorio-google-ads-dentista-joao-1610',
  '0 23 16 10 *',
  $cmd$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/relatorio-google-ads',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{"identificador":"dentista-joao","desde":"2026-10-08","saudacao":"Dr. João"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cmd$
);

SELECT cron.schedule(
  'limpeza-relatorio-google-ads-1610',
  '10 23 16 10 *',
  $cmd$ select cron.unschedule('relatorio-google-ads-dentista-joao-1610'); $cmd$
);
