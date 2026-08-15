-- 0049_crm_funcao_analise.sql
-- CRM Omnidesign — Fase 1, roadmap item 3: função de análise sobre texto
-- colado. Recebe o texto de uma conversa com linhas marcadas [A] (atendente)
-- ou [C] (cliente), casa contra crm_dicionario, grava hits, e recalcula
-- score do atendente / perfil do lead / checklist / estágio.
--
-- Formato de entrada esperado (uma mensagem por linha):
--   [A] Oi! Me conta um pouco sobre o que você precisa
--   [C] quero um site novo, meu concorrente já tem
--   [A] Perfeito, vamos mapear isso certinho...
--
-- Linhas sem prefixo [A]/[C] são ignoradas (não quebram a análise).
-- SECURITY INVOKER (padrão) de propósito: roda sob a sessão de quem chama,
-- respeitando as mesmas policies de RLS (is_super_admin()) das tabelas —
-- não precisa de DEFINER pois só super_admin tem acesso de qualquer forma.
--
-- Fonte da verdade do score é sempre a soma de crm_analise_hits (não um
-- contador incremental) — permite recalcular do zero a qualquer momento,
-- inclusive depois de marcar hits como falso_positivo (§11.5 do blueprint).

CREATE OR REPLACE FUNCTION analisar_texto_colado(p_lead_id uuid, p_texto text)
RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric, hits_novos integer)
LANGUAGE plpgsql
AS $$
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
BEGIN
  IF p_texto IS NULL OR trim(p_texto) = '' THEN
    RAISE EXCEPTION 'Texto vazio — nada para analisar.';
  END IF;

  -- seed do checklist (idempotente — não sobrescreve status já existente)
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
      v_linha := trim(substring(v_linha from 4));
    ELSIF left(v_linha, 3) ILIKE '[C]' THEN
      v_direcao := 'recebida';
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
          (tipo_match = 'ilike' AND v_linha ILIKE ('%' || padrao || '%'))
          OR (tipo_match = 'similaridade' AND similarity(v_linha, padrao) > 0.3)
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

  -- score: recalculado do zero a partir do log de hits (nunca incremental)
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
      temperatura = CASE WHEN v_perfil = 'decidido' THEN 'quente' ELSE temperatura END,
      ultima_analise_em = now()
  WHERE lead_id = p_lead_id;

  RETURN QUERY SELECT v_score, v_perfil, v_checklist_pct, v_hits_novos;
END;
$$;

GRANT EXECUTE ON FUNCTION analisar_texto_colado(uuid, text) TO authenticated;

-- Recalcula o score/perfil/checklist a partir dos hits já gravados, sem
-- processar texto novo — usado depois de marcar um hit como falso_positivo
-- (item 5 do roadmap: botão "falso positivo" precisa refletir na hora).
CREATE OR REPLACE FUNCTION recalcular_analise_lead(p_lead_id uuid)
RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric)
LANGUAGE plpgsql
AS $$
DECLARE
  v_score integer;
  v_perfil text;
  v_perfil_confirmado boolean;
  v_checklist_pct numeric;
  v_essenciais_total constant integer := 5;
  v_essenciais_ok integer;
BEGIN
  SELECT 50 + COALESCE(SUM(h.peso_aplicado) FILTER (
    WHERE h.direcao = 'enviada' AND h.falso_positivo = false
  ), 0)
  INTO v_score
  FROM crm_analise_hits h
  JOIN crm_dicionario d ON d.id = h.dicionario_id
  WHERE h.lead_id = p_lead_id AND d.categoria IN ('atendente_erro', 'atendente_acerto');

  v_score := GREATEST(0, LEAST(100, COALESCE(v_score, 50)));

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
      ultima_analise_em = now()
  WHERE lead_id = p_lead_id;

  RETURN QUERY SELECT v_score, v_perfil, v_checklist_pct;
END;
$$;

GRANT EXECUTE ON FUNCTION recalcular_analise_lead(uuid) TO authenticated;

-- Marca um hit como falso positivo e já recalcula a análise do lead numa
-- chamada só (evita 2 round-trips do client pra mesma ação de UI).
CREATE OR REPLACE FUNCTION marcar_hit_falso_positivo(p_hit_id uuid)
RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric)
LANGUAGE plpgsql
AS $$
DECLARE
  v_lead_id uuid;
BEGIN
  UPDATE crm_analise_hits SET falso_positivo = true
  WHERE id = p_hit_id
  RETURNING lead_id INTO v_lead_id;

  IF v_lead_id IS NULL THEN
    RAISE EXCEPTION 'Hit não encontrado.';
  END IF;

  RETURN QUERY SELECT * FROM recalcular_analise_lead(v_lead_id);
END;
$$;

GRANT EXECUTE ON FUNCTION marcar_hit_falso_positivo(uuid) TO authenticated;
