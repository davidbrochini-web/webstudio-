-- Google Ads: acessos por cliente/projeto (David pediu 06/09/2026, integração
-- iniciada pra Innovation Brindes só de referência de formato, essa tabela é
-- exclusiva Omnidesign — cada linha é um cliente/conta diferente, identificado
-- por `identificador` e opcionalmente ligado a um tenant do WebStudio.
--
-- Uso: Claude opera a conta via API do Google Ads (curl puro, sem SDK) usando
-- as 5 credenciais desta tabela. Nunca exposta a nenhum client-facing feature
-- do WebStudio — só lida via Management API (superuser) quando o David pedir
-- pra mexer em Google Ads de algum cliente. RLS trava pra is_super_admin()
-- mesmo assim, como camada extra (mesmo padrão de doc_ia).

CREATE TABLE google_ads_acessos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador text NOT NULL UNIQUE, -- ex: 'dentista-joao', 'omnidesign-interno'
  nome_exibicao text NOT NULL,        -- ex: 'Dr. João Victor Pimenta'
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL, -- opcional, nem toda conta tem tenant correspondente
  developer_token text NOT NULL,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  refresh_token text NOT NULL,
  mcc_id text NOT NULL,     -- só dígitos, sem traço
  customer_id text NOT NULL, -- só dígitos, sem traço
  api_version text NOT NULL DEFAULT 'v22',
  ativo boolean NOT NULL DEFAULT true,
  notas text, -- observações livres (ex: "campanha pausada aguardando aprovação do cliente")
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE google_ads_acessos ENABLE ROW LEVEL SECURITY;

CREATE POLICY google_ads_acessos_all
  ON google_ads_acessos
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

COMMENT ON TABLE google_ads_acessos IS
  'Credenciais de acesso à API do Google Ads por cliente/conta. Só is_super_admin() acessa (RLS). Nunca usada por nenhuma feature client-facing.';
