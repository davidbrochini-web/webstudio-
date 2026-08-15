-- 0051_crm_matching_sem_acento.sql
-- CRM Omnidesign — achado real testando o simulador nesta sessão: o
-- dicionário tem padrões como "tá caro" (com acento), mas mensagem real
-- de WhatsApp digitada sem acento ("ta caro"/"ta ficando caro") nunca
-- batia via ILIKE — Postgres não ignora acento por padrão. Extensão
-- `unaccent` normaliza os dois lados da comparação (mensagem E padrão),
-- sem precisar reescrever os 235 padrões já cadastrados.

CREATE EXTENSION IF NOT EXISTS unaccent;

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

    -- NOVO (0051): unaccent() nos dois lados — "ta caro" agora bate em "tá caro".
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
      temperatura = CASE WHEN v_perfil = 'decidido' THEN 'quente' ELSE temperatura END,
      ultima_analise_em = now()
  WHERE lead_id = p_lead_id;

  RETURN QUERY SELECT v_score, v_perfil, v_checklist_pct, v_hits_novos;
END;
$function$;

-- Curadoria imediata (achado do próprio teste): "caro" isolado nunca
-- tinha padrão próprio, só a frase "tá caro" — adiciona a palavra solta
-- (ilike, peso igual ao já usado nas variações de preço) nas duas
-- categorias que já tratavam a frase.
INSERT INTO crm_dicionario (categoria, subtipo, padrao, tipo_match, peso, direcao_alvo, resposta_recomendada, dica_atendente)
SELECT 'objecao', 'preco', 'caro', 'ilike', peso, direcao_alvo, resposta_recomendada, dica_atendente
FROM crm_dicionario
WHERE categoria='objecao' AND subtipo='preco' AND padrao='tá caro'
  AND NOT EXISTS (SELECT 1 FROM crm_dicionario WHERE categoria='objecao' AND subtipo='preco' AND padrao='caro');

INSERT INTO crm_dicionario (categoria, subtipo, padrao, tipo_match, peso, direcao_alvo)
SELECT 'perfil_lead', 'preco', 'caro', 'ilike', peso, direcao_alvo
FROM crm_dicionario
WHERE categoria='perfil_lead' AND subtipo='preco' AND padrao='tá caro'
  AND NOT EXISTS (SELECT 1 FROM crm_dicionario WHERE categoria='perfil_lead' AND subtipo='preco' AND padrao='caro');
