-- 0075 — Relatório Google Ads para o Dr. João, 21/10/2026 às 20h BRT (23:00 UTC)
-- Texto leigo (abertura/fechamento) + pergunta sobre os 2 leads de WhatsApp
-- de 17 e 18/10. Os números das tabelas são puxados do Google no envio.
-- Limpeza em job separado (lição 06-07/10: nunca auto-unschedule).

SELECT cron.schedule(
  'relatorio-google-ads-dentista-joao-2110',
  '0 23 21 10 *',
  $cmd$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/relatorio-google-ads',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := $json${"identificador": "dentista-joao", "desde": "2026-10-08", "saudacao": "Dr. João", "assunto": "Seus anúncios no Google: como estão indo (e os primeiros contatos!)", "abertura": ["Queria te contar como estão indo os seus anúncios no Google, de um jeito simples e sem \"tecniquês\".", "Desde o dia 14/10, quando ajustamos as campanhas, o seu anúncio passou a aparecer **todos os dias no Google** para quem procura por **implante dentário** e **cirurgião bucomaxilofacial** na região do consultório. Em média, **cerca de 7 pessoas por dia** clicam no anúncio e entram no seu site para te conhecer.", "Outro sinal muito positivo: por volta de **1 em cada 10 pessoas** que veem o anúncio clicam nele. É uma resposta muito boa, e mostra que o anúncio está chamando a atenção justamente de quem está procurando o tratamento.", "E os primeiros contatos já chegaram: **2 pessoas te chamaram no WhatsApp** pelo site, nos dias **17 e 18/10**, depois de encontrar o anúncio procurando um **cirurgião bucomaxilofacial**.", "Logo abaixo estão os números completos, dia a dia."], "fechamento": ["**Uma pergunta importante pra você:** como foram esses 2 contatos pelo WhatsApp (17 e 18/10)? Viraram consulta, ficaram de agendar, ou não eram o perfil de paciente que você procura?", "Esse retorno faz muita diferença: com ele conseguimos ajustar os anúncios para trazer cada vez mais pacientes do jeito que você quer atender.", "Os anúncios seguem no ar **todos os dias, das 7h às 22h**, e a verba está programada para durar até **08/11**."]}$json$::jsonb,
    timeout_milliseconds := 30000
  );
  $cmd$
);

SELECT cron.schedule(
  'limpeza-relatorio-google-ads-2110',
  '10 23 21 10 *',
  $cmd$ select cron.unschedule('relatorio-google-ads-dentista-joao-2110'); $cmd$
);
