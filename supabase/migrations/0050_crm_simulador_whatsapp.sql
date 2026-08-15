-- 0050_crm_simulador_whatsapp.sql
-- CRM Omnidesign — mini-simulador de WhatsApp por lead (fase de transição
-- antes da ZAP-API entrar, ver CRM_OMNIDESIGN_BLUEPRINT.md seção 1).
--
-- Deliberadamente uma tabela separada de qualquer futura `crm_mensagens`
-- real (Fase 3, schema do guia INTEGRACAO-WHATSAPP.md) — dado de teste,
-- nunca deve ser confundido com conversa real de WhatsApp quando a
-- integração de verdade entrar. Cada mensagem enviada aqui já dispara o
-- mesmo motor de análise (`analisar_texto_colado`), 1 linha por vez —
-- é o mesmo caminho que o webhook da ZAP-API vai usar na Fase 3,
-- só trocando a origem do texto.

CREATE TABLE IF NOT EXISTS crm_simulador_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads_omnidesign(id),
  direcao text NOT NULL,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_simulador_mensagens_direcao_valida CHECK (direcao = ANY (ARRAY['enviada','recebida']))
);

CREATE INDEX IF NOT EXISTS idx_crm_simulador_mensagens_lead ON crm_simulador_mensagens USING btree (lead_id, created_at);

ALTER TABLE crm_simulador_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_simulador_mensagens_select ON crm_simulador_mensagens;
CREATE POLICY crm_simulador_mensagens_select ON crm_simulador_mensagens FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_simulador_mensagens_insert ON crm_simulador_mensagens;
CREATE POLICY crm_simulador_mensagens_insert ON crm_simulador_mensagens FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_simulador_mensagens_delete ON crm_simulador_mensagens;
CREATE POLICY crm_simulador_mensagens_delete ON crm_simulador_mensagens FOR DELETE USING (is_super_admin());

-- ============================================================
-- crm_regua_followup — templates da régua (Fase 2). Estrutura criada
-- agora; os TEXTOS ficam vazios de propósito (ver blueprint §7.3 —
-- "os textos serão escritos em sessão dedicada"). Sem isso a tabela
-- não bloqueia o resto da Fase 2 (fila calculada, override manual).
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_regua_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  momento text NOT NULL,
  condicao text NOT NULL,
  template text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_regua_followup_momento_valido CHECK (momento = ANY (ARRAY[
    'followup_1','followup_2','followup_3','resgate','pos_proposta'
  ]))
);

DROP TRIGGER IF EXISTS trg_crm_regua_followup_updated ON crm_regua_followup;
CREATE TRIGGER trg_crm_regua_followup_updated BEFORE UPDATE ON crm_regua_followup
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE crm_regua_followup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS crm_regua_followup_select ON crm_regua_followup;
CREATE POLICY crm_regua_followup_select ON crm_regua_followup FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_regua_followup_insert ON crm_regua_followup;
CREATE POLICY crm_regua_followup_insert ON crm_regua_followup FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_regua_followup_update ON crm_regua_followup;
CREATE POLICY crm_regua_followup_update ON crm_regua_followup FOR UPDATE USING (is_super_admin());

-- Linhas placeholder (momento + condição já documentados, template null
-- até o David escrever o texto — ver pendência no roadmap).
INSERT INTO crm_regua_followup (momento, condicao, template)
VALUES
  ('followup_1', '24h sem resposta, estágio >= qualificando', NULL),
  ('followup_2', '3 dias sem resposta', NULL),
  ('followup_3', '7 dias sem resposta', NULL),
  ('resgate', '15 dias sem resposta', NULL),
  ('pos_proposta', '48h após proposta_enviada sem resposta', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Função auxiliar: registra 1 mensagem simulada e roda o motor de
-- análise sobre ela (idêntico ao que o webhook real vai fazer na
-- Fase 3 — só muda a origem da chamada).
-- ============================================================
CREATE OR REPLACE FUNCTION public.registrar_mensagem_simulada(p_lead_id uuid, p_direcao text, p_texto text)
RETURNS TABLE(score_atendente integer, perfil_lead text, checklist_pct numeric, hits_novos integer)
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
