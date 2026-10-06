-- 0073 — Cobranças do Dr. João (David, 06/10/2026)
-- Registrado como migration (e não só SQL avulso) por rastreabilidade:
-- é dado financeiro, precisa ficar no histórico do repositório.

-- 1) Mensalidade de 30/09 (Hospedagem R$50 + Agendamento R$50) não paga → atrasado.
UPDATE assinatura_pagamentos
SET status = 'atrasado', updated_at = now()
WHERE id IN ('e72fd893-c7db-48ff-b7bb-154bd50e56b5', '9c8e4fea-fa92-4dff-a164-cad2e5a36906')
  AND status = 'pendente';

-- 2) Gestão Google Ads: 10% sobre R$1.500 de mídia (boleto gerado pelo
--    David direto no Google Ads) = R$150, Pix, vencimento 20/10/2026.
INSERT INTO assinatura_pagamentos (item_id, valor_centavos, status, referencia, vencimento)
VALUES ('5a1a0825-ce3a-4dd4-84b4-1c74c1de8522', 15000, 'pendente',
        'Gestão Google Ads — 10% sobre R$ 1.500 de mídia (outubro/2026)', '2026-10-20');

-- 3) Aviso único da mensalidade em aberto: amanhã 07/10/2026 às 6h BRT (09:00 UTC).
--    Se desagenda sozinho depois de disparar (senão repetiria todo 7/10).
--    A rota só envia se ainda houver pagamento 'atrasado' no momento.
SELECT cron.schedule(
  'aviso-mensalidade-dentista-joao-0710',
  '0 9 7 10 *',
  $cmd$
  select net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/aviso-mensalidade-em-aberto',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_lembretes_secret')
    ),
    body := '{"tenant_id":"b4a1da6c-7e79-4757-8170-91cd7ee02068","saudacao":"Dr. João"}'::jsonb
  );
  select cron.unschedule('aviso-mensalidade-dentista-joao-0710');
  $cmd$
);
