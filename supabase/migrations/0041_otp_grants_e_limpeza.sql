-- 0041: Correções de auditoria do fluxo OTP (Dentista João).
--
-- 1. GRANT faltante: a migration 0039 criou a POLICY de insert pra
--    anon/authenticated, mas nunca deu o GRANT de INSERT na tabela —
--    policy sem grant = permission denied 42501 antes mesmo do RLS ser
--    avaliado. Resultado: o fluxo "Enviar código por e-mail" de Meus
--    Agendamentos estava quebrado em produção (o insert do código
--    falhava pra qualquer visitante). Descoberto em teste E2E com a
--    chave anon real; corrigido direto em produção e formalizado aqui.
--    Aprendizado: policy de RLS NÃO substitui GRANT — são camadas
--    separadas e ambas precisam existir.
--
-- 2. Formaliza o job de limpeza de OTPs expirados que tinha sido criado
--    via SQL avulso (sem migration) numa sessão anterior. Idempotente:
--    cron.schedule com mesmo jobname substitui o agendamento existente.

grant insert on otp_codigos to anon, authenticated;
-- Sem grant de SELECT/UPDATE/DELETE de propósito — leitura/consumo do
-- código só pela RPC verificar_otp_codigo (SECURITY DEFINER).

select cron.schedule(
  'limpeza-otp-codigos',
  '30 3 * * *',
  $$delete from otp_codigos where expira_em < now() - interval '1 day'$$
);
