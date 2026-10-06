-- 0072 — Resumo semanal da agenda do Dr. João (pedido do cliente, 06/10/2026)
--
-- Job recorrente: toda segunda às 6h BRT (09:00 UTC; offset fixo -03:00,
-- sem horário de verão). Mesmo padrão dos outros crons: pg_net chama a
-- rota da Vercel com o secret guardado no Vault.
--
-- Job de teste ÚNICO: hoje (06/10/2026) às 20h BRT (23:00 UTC), pedido do
-- David pra ver o formato antes da primeira segunda. O próprio comando
-- desagenda o job depois de disparar — sem isso, '0 23 6 10 *' repetiria
-- todo 6 de outubro.

SELECT cron.schedule(
  'resumo-semanal-dentista-joao',
  '0 9 * * 1',
  $cmd$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/resumo-semanal-dentista',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $cmd$
);

SELECT cron.schedule(
  'resumo-semanal-dentista-joao-teste',
  '0 23 6 10 *',
  $cmd$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/resumo-semanal-dentista',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  select cron.unschedule('resumo-semanal-dentista-joao-teste');
  $cmd$
);
