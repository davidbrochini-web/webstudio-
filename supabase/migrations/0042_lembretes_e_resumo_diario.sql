-- 0040: Lembretes de agendamento (24h e 1h antes) + resumo diário pro
-- Dentista João — pedido do David.
--
-- Cron via Supabase (pg_cron + pg_net), NÃO Vercel Cron: a conta Vercel
-- é Hobby, que só permite cron 1x/dia (sem precisão de horário), o que
-- inviabiliza o lembrete de 1h. Supabase já é Pro (pago) e pg_cron
-- suporta granularidade de minuto sem custo adicional — melhor conta
-- pra essa responsabilidade.
--
-- As rotas HTTP que o cron chama (app/api/cron/lembretes-agendamento e
-- app/api/cron/resumo-diario-dentista) autenticam via secret compartilhado
-- (Bearer token), guardado aqui no Vault e como env var CRON_LEMBRETES_SECRET
-- no Vercel — não existe sessão de usuário numa chamada de cron.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

alter table agendamentos add column if not exists lembrete_24h_enviado_em timestamptz;
alter table agendamentos add column if not exists lembrete_1h_enviado_em timestamptz;

-- Secret usado pelo pg_net pra autenticar nas rotas /api/cron/*. O valor
-- real é inserido separadamente (fora desta migration, via script) —
-- aqui só garante que a entrada existe, sem sobrescrever se já tiver
-- sido criada com o valor certo.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_lembretes_secret') then
    perform vault.create_secret('PLACEHOLDER_SUBSTITUIR', 'cron_lembretes_secret', 'Bearer token pras rotas /api/cron/* (lembretes + resumo diário do Dentista João)');
  end if;
end $$;

-- Job 1: lembretes de 24h e 1h — a cada 15 minutos.
select cron.schedule(
  'lembretes-agendamento-dentista-joao',
  '*/15 * * * *',
  $cron$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/lembretes-agendamento',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);

-- Job 2: resumo diário — 9h UTC = 6h BRT (sem DST desde 2019, offset fixo).
select cron.schedule(
  'resumo-diario-dentista-joao',
  '0 9 * * *',
  $cron$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/resumo-diario-dentista',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);
