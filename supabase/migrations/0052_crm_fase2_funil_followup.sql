-- 0052_crm_fase2_funil_followup.sql
-- CRM Omnidesign — Fase 2 do CRM_OMNIDESIGN_BLUEPRINT.md: fila de
-- follow-up + degradação de temperatura por tempo. Envio continua
-- SEMPRE manual (copiar/enviar) — nada aqui dispara mensagem pro lead
-- sozinho, só calcula "quem precisa de follow-up hoje" e evita repetir
-- no mesmo dia.

-- ============================================================
-- Timestamps de última mensagem por direção (evita varrer
-- crm_analise_hits toda vez que a fila precisa saber "faz quanto tempo
-- que o lead não responde").
-- ============================================================
ALTER TABLE crm_analise_conversa
  ADD COLUMN IF NOT EXISTS ultima_msg_recebida_em timestamptz,
  ADD COLUMN IF NOT EXISTS ultima_msg_enviada_em timestamptz,
  ADD COLUMN IF NOT EXISTS ultimo_followup_marcado_em timestamptz,
  ADD COLUMN IF NOT EXISTS escalonado_email_em timestamptz;

-- ============================================================
-- analisar_texto_colado — mesma lógica de 0051, só adicionando a
-- atualização dos timestamps de última mensagem por direção.
-- ============================================================
CREATE OR REPLACE FUNCTION public.analisar_texto_colado(p_lead_id uuid, p_texto text)
 RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric, hits_novos integer)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_linha text;
  v_direcao text;
  v_contem_audio boolean := false;
  v_hits_novos integer := 0;
  v_score integer;
  v_perfil text;
  v_perfil_confirmado boolean;
  v_checklist_pct numeric;
  v_essenciais_total constant integer := 5;
  v_essenciais_ok integer;
  v_dic record;
  v_teve_recebida boolean := false;
  v_teve_enviada boolean := false;
BEGIN
  IF p_texto IS NULL OR trim(p_texto) = '' THEN
    RAISE EXCEPTION 'Texto vazio — nada para analisar.';
  END IF;

  INSERT INTO crm_qualificacao (lead_id, item, essencial) VALUES
    (p_lead_id, 'tem_site', true),
    (p_lead_id, 'objetivo_principal', true),
    (p_lead_id, 'urgencia_prazo', true),
    (p_lead_id, 'quem_decide', true),
    (p_lead_id, 'interesse_mapeado', true),
    (p_lead_id, 'faixa_investimento', false),
    (p_lead_id, 'concorrente_citado', false),
    (p_lead_id, 'sistema_legado', false)
  ON CONFLICT (lead_id, item) DO NOTHING;

  INSERT INTO crm_analise_conversa (lead_id) VALUES (p_lead_id)
  ON CONFLICT (lead_id) DO NOTHING;

  FOR v_linha IN SELECT unnest(string_to_array(p_texto, E'\n')) LOOP
    v_linha := trim(v_linha);
    CONTINUE WHEN v_linha = '';

    IF left(v_linha, 3) ILIKE '[A]' THEN
      v_direcao := 'enviada';
      v_teve_enviada := true;
      v_linha := trim(substring(v_linha from 4));
    ELSIF left(v_linha, 3) ILIKE '[C]' THEN
      v_direcao := 'recebida';
      v_teve_recebida := true;
      v_linha := trim(substring(v_linha from 4));
    ELSE
      CONTINUE;
    END IF;

    CONTINUE WHEN v_linha = '';

    IF v_linha ILIKE '%<áudio%' OR v_linha ILIKE '%[áudio%' OR v_linha ILIKE '%audio omitido%'
       OR v_linha ILIKE '%mensagem de voz%' THEN
      v_contem_audio := true;
    END IF;

    FOR v_dic IN
      SELECT id, categoria, subtipo, peso
      FROM crm_dicionario
      WHERE ativo = true
        AND (direcao_alvo = v_direcao OR direcao_alvo = 'ambas')
        AND (
          (tipo_match = 'ilike' AND unaccent(v_linha) ILIKE ('%' || unaccent(padrao) || '%'))
          OR (tipo_match = 'similaridade' AND similarity(unaccent(v_linha), unaccent(padrao)) > 0.3)
        )
    LOOP
      INSERT INTO crm_analise_hits (lead_id, dicionario_id, tipo_hit, direcao, texto_trecho, peso_aplicado)
      VALUES (p_lead_id, v_dic.id, 'dicionario', v_direcao, left(v_linha, 300), v_dic.peso);
      v_hits_novos := v_hits_novos + 1;

      IF v_dic.categoria = 'qualificacao' THEN
        UPDATE crm_qualificacao
        SET status = 'detectado', detectado_em = now()
        WHERE lead_id = p_lead_id AND item = v_dic.subtipo AND status = 'pendente';
      END IF;

      IF v_dic.categoria = 'interesse' THEN
        INSERT INTO crm_interesses_lead (lead_id, servico, origem, detectado_em)
        VALUES (p_lead_id, v_dic.subtipo, 'auto', now())
        ON CONFLICT (lead_id, servico) DO NOTHING;

        UPDATE crm_qualificacao
        SET status = 'detectado', detectado_em = now()
        WHERE lead_id = p_lead_id AND item = 'interesse_mapeado' AND status = 'pendente';
      END IF;
    END LOOP;
  END LOOP;

  SELECT 50 + COALESCE(SUM(h.peso_aplicado) FILTER (
    WHERE h.direcao = 'enviada' AND h.falso_positivo = false
  ), 0)
  INTO v_score
  FROM crm_analise_hits h
  JOIN crm_dicionario d ON d.id = h.dicionario_id
  WHERE h.lead_id = p_lead_id AND d.categoria IN ('atendente_erro', 'atendente_acerto');

  v_score := GREATEST(0, LEAST(100, v_score));

  SELECT perfil_confirmado INTO v_perfil_confirmado
  FROM crm_analise_conversa WHERE lead_id = p_lead_id;

  IF NOT COALESCE(v_perfil_confirmado, false) THEN
    SELECT d.subtipo INTO v_perfil
    FROM crm_analise_hits h
    JOIN crm_dicionario d ON d.id = h.dicionario_id
    WHERE h.lead_id = p_lead_id AND d.categoria = 'perfil_lead' AND h.falso_positivo = false
    GROUP BY d.subtipo
    HAVING count(*) >= 2
    ORDER BY count(*) DESC
    LIMIT 1;
  ELSE
    SELECT perfil_lead INTO v_perfil FROM crm_analise_conversa WHERE lead_id = p_lead_id;
  END IF;

  SELECT count(*) FILTER (WHERE status IN ('detectado', 'confirmado'))
  INTO v_essenciais_ok
  FROM crm_qualificacao WHERE lead_id = p_lead_id AND essencial = true;

  v_checklist_pct := round((v_essenciais_ok::numeric / v_essenciais_total) * 100, 1);

  UPDATE crm_analise_conversa
  SET score_atendente = v_score,
      perfil_lead = v_perfil,
      checklist_pct = v_checklist_pct,
      contem_audio = contem_audio OR v_contem_audio,
      estagio = CASE
        WHEN estagio = 'novo' THEN 'contato_iniciado'
        WHEN estagio = 'contato_iniciado'
             AND EXISTS (SELECT 1 FROM crm_analise_hits WHERE lead_id = p_lead_id AND direcao = 'recebida')
          THEN 'qualificando'
        WHEN estagio = 'qualificando' AND v_essenciais_ok = v_essenciais_total THEN 'qualificado'
        ELSE estagio
      END,
      -- Resposta rápida do lead reaquece a temperatura na hora (não
      -- espera o cron horário) — mas nunca sobrescreve 'quente' setado
      -- por perfil decidido.
      temperatura = CASE
        WHEN v_perfil = 'decidido' THEN 'quente'
        WHEN v_teve_recebida AND temperatura IN ('esfriando', 'frio') THEN 'morno'
        ELSE temperatura
      END,
      ultima_msg_recebida_em = CASE WHEN v_teve_recebida THEN now() ELSE ultima_msg_recebida_em END,
      ultima_msg_enviada_em = CASE WHEN v_teve_enviada THEN now() ELSE ultima_msg_enviada_em END,
      -- lead respondeu -> zera a contagem de follow-up (regra §7.2 do blueprint)
      ultimo_followup_marcado_em = CASE WHEN v_teve_recebida THEN NULL ELSE ultimo_followup_marcado_em END,
      ultima_analise_em = now()
  WHERE lead_id = p_lead_id;

  RETURN QUERY SELECT v_score, v_perfil, v_checklist_pct, v_hits_novos;
END;
$function$;

-- ============================================================
-- Marcar follow-up como enviado (envio é manual — atendente copia o
-- texto e manda pelo WhatsApp de verdade; isso só tira o lead da fila
-- de hoje e impede reenvio no mesmo dia).
-- ============================================================
CREATE OR REPLACE FUNCTION public.marcar_followup_enviado(p_lead_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE crm_analise_conversa SET ultimo_followup_marcado_em = now() WHERE lead_id = p_lead_id;
$$;

-- ============================================================
-- Recalcula temperatura por tempo (§4.3 do blueprint) — não mexe em
-- quem já está 'quente' por perfil decidido recente, só degrada
-- conversas paradas. Rodado por pg_cron 1x/hora.
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalcular_temperaturas()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_atualizados integer;
BEGIN
  WITH atualizados AS (
    UPDATE crm_analise_conversa
    SET temperatura = CASE
      WHEN ultima_msg_recebida_em IS NULL OR ultima_msg_recebida_em < now() - interval '15 days' THEN 'frio'
      WHEN ultima_msg_recebida_em < now() - interval '3 days' THEN 'esfriando'
      ELSE temperatura
    END
    WHERE estagio NOT IN ('fechado_ganho', 'fechado_perdido')
      AND perfil_lead IS DISTINCT FROM 'decidido'
      AND (
        (ultima_msg_recebida_em IS NULL OR ultima_msg_recebida_em < now() - interval '15 days') AND temperatura != 'frio'
        OR (ultima_msg_recebida_em < now() - interval '3 days' AND ultima_msg_recebida_em >= now() - interval '15 days') AND temperatura NOT IN ('esfriando','frio')
      )
    RETURNING 1
  )
  SELECT count(*) INTO v_atualizados FROM atualizados;
  RETURN v_atualizados;
END;
$$;

-- ============================================================
-- Fila de follow-up — view calculada on-demand (§7.1 do blueprint).
-- Um lead entra na fila quando cruza um dos limiares de tempo sem
-- resposta E ainda não foi marcado como "follow-up enviado" desde
-- então. Nunca reaparece 2x no mesmo dia (regra §7.2) porque
-- ultimo_followup_marcado_em só é limpo quando o lead responde.
-- ============================================================
CREATE OR REPLACE VIEW crm_fila_followup AS
SELECT
  c.lead_id,
  l.nome,
  l.telefone,
  l.texto_envio,
  c.estagio,
  c.temperatura,
  c.perfil_lead,
  c.ultima_msg_recebida_em,
  c.ultima_msg_enviada_em,
  CASE
    WHEN c.estagio = 'proposta_enviada' AND c.ultima_msg_enviada_em < now() - interval '48 hours'
      THEN 'pos_proposta'
    WHEN c.ultima_msg_recebida_em < now() - interval '15 days' THEN 'resgate'
    WHEN c.ultima_msg_recebida_em < now() - interval '7 days' THEN 'followup_3'
    WHEN c.ultima_msg_recebida_em < now() - interval '3 days' THEN 'followup_2'
    WHEN c.ultima_msg_recebida_em < now() - interval '24 hours' THEN 'followup_1'
    ELSE NULL
  END AS momento,
  r.template
FROM crm_analise_conversa c
JOIN leads_omnidesign l ON l.id = c.lead_id AND l.deleted_at IS NULL
LEFT JOIN crm_regua_followup r ON r.momento = (
  CASE
    WHEN c.estagio = 'proposta_enviada' AND c.ultima_msg_enviada_em < now() - interval '48 hours'
      THEN 'pos_proposta'
    WHEN c.ultima_msg_recebida_em < now() - interval '15 days' THEN 'resgate'
    WHEN c.ultima_msg_recebida_em < now() - interval '7 days' THEN 'followup_3'
    WHEN c.ultima_msg_recebida_em < now() - interval '3 days' THEN 'followup_2'
    WHEN c.ultima_msg_recebida_em < now() - interval '24 hours' THEN 'followup_1'
    ELSE NULL
  END
) AND r.ativo = true
WHERE c.estagio NOT IN ('fechado_ganho', 'fechado_perdido')
  AND c.estagio != 'novo'
  AND c.ultima_msg_recebida_em IS NOT NULL
  AND (c.ultimo_followup_marcado_em IS NULL OR c.ultimo_followup_marcado_em < current_date)
  AND (
    (c.estagio = 'proposta_enviada' AND c.ultima_msg_enviada_em < now() - interval '48 hours')
    OR c.ultima_msg_recebida_em < now() - interval '24 hours'
  );

-- ============================================================
-- pg_cron: recalcular temperaturas 1x/hora (puro SQL, sem HTTP —
-- não depende do Vercel estar de pé).
-- ============================================================
-- cron.schedule(jobname, ...) já substitui o job existente com o mesmo
-- nome (sem duplicar) — seguro rodar a migration de novo.
SELECT cron.schedule(
  'crm-recalcular-temperaturas',
  '0 * * * *',
  $cron$ SELECT recalcular_temperaturas(); $cron$
);

-- ============================================================
-- pg_cron: checar escalonamentos pendentes e disparar e-mail — via
-- HTTP (precisa do Resend, que só existe na app), reaproveitando o
-- secret já usado pelos crons do Dentista João.
-- ============================================================
SELECT cron.schedule(
  'crm-escalonamento-email',
  '*/30 * * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/crm-escalonamento',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $cron$
);

-- RLS: view herda das tabelas base (crm_analise_conversa já tem RLS
-- super-admin); Postgres aplica RLS das tabelas subjacentes em views
-- simples (não SECURITY DEFINER), então nenhuma policy extra é
-- necessária aqui.
