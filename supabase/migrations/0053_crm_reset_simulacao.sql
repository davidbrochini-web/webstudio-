-- 0053_crm_reset_simulacao.sql
-- CRM Omnidesign — botão "resetar conversa" no simulador de WhatsApp.
-- Apaga o transcript simulado E a análise derivada dele (hits,
-- interesses, checklist volta a pendente, conversa volta ao estado
-- inicial) — reset completo, não só o chat, senão o termômetro/perfil/
-- checklist ficariam "presos" numa conversa que não existe mais.

CREATE OR REPLACE FUNCTION public.resetar_simulacao_lead(p_lead_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM crm_simulador_mensagens WHERE lead_id = p_lead_id;
  DELETE FROM crm_analise_hits WHERE lead_id = p_lead_id;
  DELETE FROM crm_interesses_lead WHERE lead_id = p_lead_id;

  UPDATE crm_qualificacao
  SET status = 'pendente', detectado_em = NULL, confirmado_em = NULL, confirmado_por = NULL
  WHERE lead_id = p_lead_id;

  UPDATE crm_analise_conversa
  SET score_atendente = 50,
      perfil_lead = NULL,
      perfil_confirmado = false,
      temperatura = 'morno',
      estagio = 'novo',
      checklist_pct = 0,
      contem_audio = false,
      ultima_msg_recebida_em = NULL,
      ultima_msg_enviada_em = NULL,
      ultimo_followup_marcado_em = NULL,
      escalonado_email_em = NULL,
      ultima_analise_em = NULL
  WHERE lead_id = p_lead_id;
END;
$$;
