-- 0055_crm_dicionario_expandido_e_feedback_imediato.sql
-- CRM Omnidesign — duas melhorias pedidas: (1) motor mais inteligente
-- de verdade precisa de mais cobertura no dicionário, não só a UI
-- bonita por cima; (2) feedback imediato na mensagem que acabou de ser
-- enviada, não só um placar acumulado que o atendente tem que ir
-- caçar depois.

-- ============================================================
-- PARTE 1 — expansão do dicionário nas categorias mais rasas
-- (menos de 6-7 variações), com foco no que mais ajuda o
-- atendente a não errar/perder o cliente. Todas via ilike (bastam
-- palavras/trechos curtos) e reaproveitando unaccent() já em uso.
-- ============================================================

INSERT INTO crm_dicionario (categoria, subtipo, padrao, tipo_match, peso, direcao_alvo, dica_atendente) VALUES
-- atendente_erro / linguagem_negativa
('atendente_erro', 'linguagem_negativa', 'não fazemos isso', 'ilike', -5, 'enviada', '💡 Troque "não fazemos" por "vamos analisar o melhor caminho"'),
('atendente_erro', 'linguagem_negativa', 'não dá pra fazer', 'ilike', -5, 'enviada', '💡 Troque "não dá" por "vamos analisar o melhor caminho"'),
('atendente_erro', 'linguagem_negativa', 'infelizmente não', 'ilike', -5, 'enviada', '💡 Evite abrir com negativa — foque na alternativa'),
-- atendente_erro / minimiza_migracao
('atendente_erro', 'minimiza_migracao', 'super simples migrar', 'ilike', -10, 'enviada', '⚠️ Migração é serviço à parte, sempre — nunca minimizar'),
('atendente_erro', 'minimiza_migracao', 'rapidinho migramos', 'ilike', -10, 'enviada', '⚠️ Migração é serviço à parte, sempre — nunca minimizar'),
-- atendente_erro / prazo_sem_validacao
('atendente_erro', 'prazo_sem_validacao', 'essa semana já sai', 'ilike', -10, 'enviada', '⚠️ Prazo só depois do levantamento'),
('atendente_erro', 'prazo_sem_validacao', 'amanhã já fica pronto', 'ilike', -10, 'enviada', '⚠️ Prazo só depois do levantamento'),
-- atendente_erro / preco_fechado_site
('atendente_erro', 'preco_fechado_site', 'o valor do site é', 'ilike', -15, 'enviada', '⚠️ Site não tem preço fechado — avaliar, mapear e orçar'),
('atendente_erro', 'preco_fechado_site', 'cobramos r$', 'ilike', -15, 'enviada', '⚠️ Site não tem preço fechado — avaliar, mapear e orçar'),
-- atendente_erro / promessa_integracao_terceiro
('atendente_erro', 'promessa_integracao_terceiro', 'garanto que aprova', 'ilike', -10, 'enviada', '⚠️ Aprovação de terceiros nunca é garantida'),
('atendente_erro', 'promessa_integracao_terceiro', 'com certeza libera', 'ilike', -10, 'enviada', '⚠️ Aprovação de terceiros nunca é garantida'),
-- atendente_erro / desconto_proprio (mais variações informais)
('atendente_erro', 'desconto_proprio', 'te dou uma condição', 'ilike', -20, 'enviada', '🚨 Desconto é decisão do gestor — escalar antes de oferecer'),
('atendente_erro', 'desconto_proprio', 'um precinho especial', 'ilike', -20, 'enviada', '🚨 Desconto é decisão do gestor — escalar antes de oferecer'),

-- atendente_acerto / pergunta_descoberta
('atendente_acerto', 'pergunta_descoberta', 'pode me contar', 'ilike', 10, 'enviada', NULL),
('atendente_acerto', 'pergunta_descoberta', 'me ajuda a entender', 'ilike', 10, 'enviada', NULL),
('atendente_acerto', 'pergunta_descoberta', 'queria entender melhor', 'ilike', 10, 'enviada', NULL),
-- atendente_acerto / proximo_passo
('atendente_acerto', 'proximo_passo', 'vamos marcar', 'ilike', 10, 'enviada', NULL),
('atendente_acerto', 'proximo_passo', 'fico no aguardo', 'ilike', 5, 'enviada', NULL),
-- atendente_acerto / linguagem_levantamento
('atendente_acerto', 'linguagem_levantamento', 'preciso entender melhor pra te ajudar', 'ilike', 10, 'enviada', NULL),

-- objecao / empresa_pequena
('objecao', 'empresa_pequena', 'vocês são poucos', 'ilike', -5, 'recebida', NULL),
('objecao', 'empresa_pequena', 'quantas pessoas trabalham', 'ilike', -5, 'recebida', NULL),
-- objecao / resultado_antes_pagar
('objecao', 'resultado_antes_pagar', 'preciso ver antes', 'ilike', -5, 'recebida', NULL),
('objecao', 'resultado_antes_pagar', 'só confio vendo pronto', 'ilike', -5, 'recebida', NULL),

-- qualificacao / concorrente_citado
('qualificacao', 'concorrente_citado', 'comparando com outra', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'concorrente_citado', 'peguei orçamento também', 'ilike', 0, 'recebida', NULL),
-- qualificacao / faixa_investimento
('qualificacao', 'faixa_investimento', 'consigo pagar até', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'faixa_investimento', 'tenho verba de', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'faixa_investimento', 'meu limite é', 'ilike', 0, 'recebida', NULL),
-- qualificacao / tem_site
('qualificacao', 'tem_site', 'site desatualizado', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'tem_site', 'site parado', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'tem_site', 'não atualizamos o site', 'ilike', 0, 'recebida', NULL),
-- qualificacao / sistema_legado
('qualificacao', 'sistema_legado', 'controlo em caderno', 'ilike', 0, 'recebida', NULL),
('qualificacao', 'sistema_legado', 'anoto tudo no papel', 'ilike', 0, 'recebida', NULL),

-- escalonamento / juridico
('escalonamento', 'juridico', 'advogado', 'ilike', 0, 'recebida', NULL),
('escalonamento', 'juridico', 'processo', 'ilike', 0, 'recebida', NULL),
-- escalonamento / mudanca_escopo
('escalonamento', 'mudanca_escopo', 'quero mudar o que combinamos', 'ilike', 0, 'recebida', NULL),
('escalonamento', 'mudanca_escopo', 'posso incluir mais uma coisa', 'ilike', 0, 'recebida', NULL),
-- escalonamento / pedido_desconto
('escalonamento', 'pedido_desconto', 'topa fazer mais barato', 'ilike', 0, 'recebida', NULL),
('escalonamento', 'pedido_desconto', 'à vista tem desconto', 'ilike', 0, 'recebida', NULL),
-- escalonamento / reclamacao
('escalonamento', 'reclamacao', 'quero meu dinheiro de volta', 'ilike', 0, 'recebida', NULL),
('escalonamento', 'reclamacao', 'vou denunciar', 'ilike', 0, 'recebida', NULL)
;

-- ============================================================
-- PARTE 2 — feedback imediato: analisar_texto_colado passa a
-- retornar também um jsonb com os hits desta chamada que têm dica
-- (atendente_erro/acerto) ou resposta recomendada (objeção) — pra UI
-- mostrar na hora, junto da mensagem que acabou de ser enviada, sem
-- o atendente ter que ir caçar no painel.
-- ============================================================

DROP FUNCTION IF EXISTS public.analisar_texto_colado(uuid, text);
CREATE OR REPLACE FUNCTION public.analisar_texto_colado(p_lead_id uuid, p_texto text)
 RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric, hits_novos integer, detalhes jsonb)
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
  v_detalhes jsonb := '[]'::jsonb;
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
      SELECT id, categoria, subtipo, peso, dica_atendente, resposta_recomendada
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

      IF v_dic.categoria IN ('atendente_erro', 'atendente_acerto', 'objecao')
         AND COALESCE(v_dic.dica_atendente, v_dic.resposta_recomendada) IS NOT NULL THEN
        v_detalhes := v_detalhes || jsonb_build_object(
          'categoria', v_dic.categoria,
          'texto', COALESCE(v_dic.dica_atendente, v_dic.resposta_recomendada)
        );
      END IF;

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
      temperatura = CASE
        WHEN v_perfil = 'decidido' THEN 'quente'
        WHEN v_teve_recebida AND temperatura IN ('esfriando', 'frio') THEN 'morno'
        ELSE temperatura
      END,
      ultima_msg_recebida_em = CASE WHEN v_teve_recebida THEN now() ELSE ultima_msg_recebida_em END,
      ultima_msg_enviada_em = CASE WHEN v_teve_enviada THEN now() ELSE ultima_msg_enviada_em END,
      ultimo_followup_marcado_em = CASE WHEN v_teve_recebida THEN NULL ELSE ultimo_followup_marcado_em END,
      ultima_analise_em = now()
  WHERE lead_id = p_lead_id;

  RETURN QUERY SELECT v_score, v_perfil, v_checklist_pct, v_hits_novos, v_detalhes;
END;
$function$;

-- registrar_mensagem_simulada só repassa o retorno de analisar_texto_colado
-- (mesma assinatura de saída, agora com detalhes) — recriar por causa do
-- RETURNS TABLE ter mudado.
DROP FUNCTION IF EXISTS public.registrar_mensagem_simulada(uuid, text, text);
CREATE OR REPLACE FUNCTION public.registrar_mensagem_simulada(p_lead_id uuid, p_direcao text, p_texto text)
RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric, hits_novos integer, detalhes jsonb)
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefixo text;
BEGIN
  IF p_direcao NOT IN ('enviada', 'recebida') THEN
    RAISE EXCEPTION 'Direção inválida.';
  END IF;

  IF p_texto IS NULL OR trim(p_texto) = '' THEN
    RAISE EXCEPTION 'Mensagem vazia.';
  END IF;

  INSERT INTO crm_simulador_mensagens (lead_id, direcao, texto)
  VALUES (p_lead_id, p_direcao, trim(p_texto));

  v_prefixo := CASE WHEN p_direcao = 'enviada' THEN '[A] ' ELSE '[C] ' END;

  RETURN QUERY SELECT * FROM analisar_texto_colado(p_lead_id, v_prefixo || trim(p_texto));
END;
$$;
