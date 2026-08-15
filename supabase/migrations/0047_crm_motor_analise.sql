-- 0047_crm_motor_analise.sql
-- CRM Omnidesign — Fase 1 do CRM_OMNIDESIGN_BLUEPRINT.md: motor de análise
-- sobre texto colado (termômetros, funil, checklist, interesses).
--
-- NOTA: esta migration já estava aplicada em produção (via Management API,
-- numa sessão anterior cujo commit ficou bloqueado por um proxy de git
-- restrito a esta sessão específica — ver ESTRUTURA_OMNIDESIGN-v2.md,
-- seção 12/13). Reconstruída nesta sessão a partir do schema live
-- (information_schema + pg_constraint + pg_indexes + pg_policies +
-- information_schema.triggers) pra sincronizar repo com banco. Usa
-- IF NOT EXISTS / DROP POLICY IF EXISTS em tudo pra ser seguro rodar de
-- novo caso o ambiente já tenha essas tabelas.

-- ============================================================
-- crm_dicionario — coração do motor: cada linha é um padrão de detecção
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_dicionario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  subtipo text,
  padrao text NOT NULL,
  tipo_match text NOT NULL DEFAULT 'ilike',
  peso integer NOT NULL DEFAULT 1,
  direcao_alvo text NOT NULL,
  resposta_recomendada text,
  dica_atendente text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_dicionario_categoria_valida CHECK (categoria = ANY (ARRAY[
    'atendente_erro','atendente_acerto','perfil_lead','objecao','interesse','qualificacao','escalonamento'
  ])),
  CONSTRAINT crm_dicionario_tipo_match_valido CHECK (tipo_match = ANY (ARRAY['ilike','similaridade'])),
  CONSTRAINT crm_dicionario_direcao_valida CHECK (direcao_alvo = ANY (ARRAY['enviada','recebida','ambas']))
);

CREATE INDEX IF NOT EXISTS idx_crm_dicionario_categoria_ativo ON crm_dicionario USING btree (categoria, ativo);
CREATE INDEX IF NOT EXISTS idx_crm_dicionario_padrao_trgm ON crm_dicionario USING gin (padrao gin_trgm_ops)
  WHERE (tipo_match = 'similaridade' AND ativo);

-- ============================================================
-- crm_analise_conversa — estado consolidado da análise por lead
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_analise_conversa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads_omnidesign(id),
  score_atendente integer NOT NULL DEFAULT 50,
  perfil_lead text,
  perfil_confirmado boolean NOT NULL DEFAULT false,
  temperatura text NOT NULL DEFAULT 'morno',
  estagio text NOT NULL DEFAULT 'novo',
  checklist_pct numeric NOT NULL DEFAULT 0,
  contem_audio boolean NOT NULL DEFAULT false,
  ultima_analise_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_analise_conversa_perfil_valido CHECK (perfil_lead IS NULL OR perfil_lead = ANY (ARRAY[
    'decidido','pesquisador','preco','desconfiado','ocupado','entusiasmado'
  ])),
  CONSTRAINT crm_analise_conversa_temperatura_valida CHECK (temperatura = ANY (ARRAY[
    'quente','morno','esfriando','frio'
  ])),
  CONSTRAINT crm_analise_conversa_estagio_valido CHECK (estagio = ANY (ARRAY[
    'novo','contato_iniciado','qualificando','qualificado','proposta_enviada','negociacao','fechado_ganho','fechado_perdido'
  ]))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_analise_conversa_lead ON crm_analise_conversa USING btree (lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_analise_conversa_estagio ON crm_analise_conversa USING btree (estagio);
CREATE INDEX IF NOT EXISTS idx_crm_analise_conversa_temperatura ON crm_analise_conversa USING btree (temperatura);

-- ============================================================
-- crm_analise_hits — log append-only de cada detecção (auditável)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_analise_hits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads_omnidesign(id),
  dicionario_id uuid REFERENCES crm_dicionario(id),
  tipo_hit text NOT NULL DEFAULT 'dicionario',
  direcao text NOT NULL,
  texto_trecho text,
  peso_aplicado integer NOT NULL DEFAULT 0,
  falso_positivo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_analise_hits_tipo_hit_valido CHECK (tipo_hit = ANY (ARRAY['dicionario','tempo'])),
  CONSTRAINT crm_analise_hits_direcao_valida CHECK (direcao = ANY (ARRAY['enviada','recebida'])),
  CONSTRAINT crm_analise_hits_dicionario_coerente CHECK (
    (tipo_hit = 'dicionario' AND dicionario_id IS NOT NULL) OR
    (tipo_hit = 'tempo' AND dicionario_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_crm_analise_hits_lead ON crm_analise_hits USING btree (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_analise_hits_dicionario ON crm_analise_hits USING btree (dicionario_id);

-- ============================================================
-- crm_qualificacao — checklist de qualificação por lead
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_qualificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads_omnidesign(id),
  item text NOT NULL,
  essencial boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pendente',
  detectado_em timestamptz,
  confirmado_em timestamptz,
  confirmado_por uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_qualificacao_item_valido CHECK (item = ANY (ARRAY[
    'tem_site','objetivo_principal','urgencia_prazo','quem_decide','interesse_mapeado',
    'faixa_investimento','concorrente_citado','sistema_legado'
  ])),
  CONSTRAINT crm_qualificacao_status_valido CHECK (status = ANY (ARRAY[
    'pendente','detectado','confirmado','nao_se_aplica'
  ]))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_qualificacao_lead_item ON crm_qualificacao USING btree (lead_id, item);

-- ============================================================
-- crm_interesses_lead — checkboxes de interesse (serviço x origem)
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_interesses_lead (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads_omnidesign(id),
  servico text NOT NULL,
  origem text NOT NULL DEFAULT 'auto',
  confirmado boolean NOT NULL DEFAULT false,
  detectado_em timestamptz,
  confirmado_em timestamptz,
  confirmado_por uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT crm_interesses_lead_servico_valido CHECK (servico = ANY (ARRAY[
    'site_institucional','google_ads','chatgpt_ads','trafego_pago_generico',
    'google_meu_negocio','manutencao_site','modulos_gestao','sob_medida'
  ])),
  CONSTRAINT crm_interesses_lead_origem_valida CHECK (origem = ANY (ARRAY['auto','manual']))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_interesses_lead_lead_servico ON crm_interesses_lead USING btree (lead_id, servico);

-- ============================================================
-- Triggers de updated_at (reaproveita set_updated_at() já existente)
-- ============================================================
DROP TRIGGER IF EXISTS trg_crm_dicionario_updated ON crm_dicionario;
CREATE TRIGGER trg_crm_dicionario_updated BEFORE UPDATE ON crm_dicionario
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crm_analise_conversa_updated ON crm_analise_conversa;
CREATE TRIGGER trg_crm_analise_conversa_updated BEFORE UPDATE ON crm_analise_conversa
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crm_qualificacao_updated ON crm_qualificacao;
CREATE TRIGGER trg_crm_qualificacao_updated BEFORE UPDATE ON crm_qualificacao
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crm_interesses_lead_updated ON crm_interesses_lead;
CREATE TRIGGER trg_crm_interesses_lead_updated BEFORE UPDATE ON crm_interesses_lead
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS — mesmo padrão super-admin do resto do CRM (is_super_admin(),
-- SECURITY DEFINER já existente)
-- ============================================================
ALTER TABLE crm_dicionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_analise_conversa ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_analise_hits ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_qualificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interesses_lead ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_dicionario_select ON crm_dicionario;
CREATE POLICY crm_dicionario_select ON crm_dicionario FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_dicionario_insert ON crm_dicionario;
CREATE POLICY crm_dicionario_insert ON crm_dicionario FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_dicionario_update ON crm_dicionario;
CREATE POLICY crm_dicionario_update ON crm_dicionario FOR UPDATE USING (is_super_admin());
DROP POLICY IF EXISTS crm_dicionario_delete ON crm_dicionario;
CREATE POLICY crm_dicionario_delete ON crm_dicionario FOR DELETE USING (is_super_admin());

DROP POLICY IF EXISTS crm_analise_conversa_select ON crm_analise_conversa;
CREATE POLICY crm_analise_conversa_select ON crm_analise_conversa FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_analise_conversa_insert ON crm_analise_conversa;
CREATE POLICY crm_analise_conversa_insert ON crm_analise_conversa FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_analise_conversa_update ON crm_analise_conversa;
CREATE POLICY crm_analise_conversa_update ON crm_analise_conversa FOR UPDATE USING (is_super_admin());

DROP POLICY IF EXISTS crm_analise_hits_select ON crm_analise_hits;
CREATE POLICY crm_analise_hits_select ON crm_analise_hits FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_analise_hits_insert ON crm_analise_hits;
CREATE POLICY crm_analise_hits_insert ON crm_analise_hits FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_analise_hits_update ON crm_analise_hits;
CREATE POLICY crm_analise_hits_update ON crm_analise_hits FOR UPDATE USING (is_super_admin());

DROP POLICY IF EXISTS crm_qualificacao_select ON crm_qualificacao;
CREATE POLICY crm_qualificacao_select ON crm_qualificacao FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_qualificacao_insert ON crm_qualificacao;
CREATE POLICY crm_qualificacao_insert ON crm_qualificacao FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_qualificacao_update ON crm_qualificacao;
CREATE POLICY crm_qualificacao_update ON crm_qualificacao FOR UPDATE USING (is_super_admin());

DROP POLICY IF EXISTS crm_interesses_lead_select ON crm_interesses_lead;
CREATE POLICY crm_interesses_lead_select ON crm_interesses_lead FOR SELECT USING (is_super_admin());
DROP POLICY IF EXISTS crm_interesses_lead_insert ON crm_interesses_lead;
CREATE POLICY crm_interesses_lead_insert ON crm_interesses_lead FOR INSERT TO authenticated WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS crm_interesses_lead_update ON crm_interesses_lead;
CREATE POLICY crm_interesses_lead_update ON crm_interesses_lead FOR UPDATE USING (is_super_admin());
