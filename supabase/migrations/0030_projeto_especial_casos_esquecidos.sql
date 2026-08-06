-- 0030: Projeto Especial #2 — Casos Esquecidos
-- Estende pagelayout, cria tabela contos isolada por site_id, RLS, RPC, triggers, indices

ALTER TABLE sites DROP CONSTRAINT sites_pagelayout_check;
ALTER TABLE sites ADD CONSTRAINT sites_pagelayout_check
  CHECK (pagelayout = ANY (ARRAY['clinico'::text, 'editorial'::text, 'portfolio'::text, 'urbano'::text, 'performance'::text, 'zen'::text, 'acolhedor'::text, 'dentista-joao'::text, 'casos-esquecidos'::text]));

CREATE TABLE contos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  resumo TEXT NOT NULL,
  texto_html TEXT NOT NULL,
  imagem_url TEXT,
  tempo_leitura TEXT,
  publicado BOOLEAN DEFAULT true,
  temas TEXT[] DEFAULT '{}',
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (site_id, numero),
  UNIQUE (site_id, slug)
);

CREATE INDEX idx_contos_site_id ON contos(site_id);
CREATE INDEX idx_contos_slug ON contos(slug);
CREATE INDEX idx_contos_publicado ON contos(publicado);
CREATE INDEX idx_contos_numero ON contos(numero);
CREATE INDEX idx_contos_temas ON contos USING gin(temas);
CREATE INDEX idx_contos_data_publicacao ON contos(data_publicacao);

CREATE TRIGGER trg_contos_updated_at
  BEFORE UPDATE ON contos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE contos ENABLE ROW LEVEL SECURITY;

CREATE POLICY contos_select ON contos
  FOR SELECT
  USING (
    is_admin_of_site(site_id) OR is_super_admin()
    OR (publicado = true AND data_publicacao <= now())
  );

CREATE POLICY contos_insert ON contos
  FOR INSERT
  WITH CHECK (is_admin_of_site(site_id) OR is_super_admin());

CREATE POLICY contos_update ON contos
  FOR UPDATE
  USING (is_admin_of_site(site_id) OR is_super_admin());

CREATE POLICY contos_delete ON contos
  FOR DELETE
  USING (is_admin_of_site(site_id) OR is_super_admin());

-- NOTA: a primeira versão desta migration usava uma policy FOR ALL com
-- EXISTS direto em `memberships`. Isso quebrava leitura anônima (site
-- público) com "permission denied for table memberships" — Postgres
-- avalia TODAS as policies permissivas de SELECT, mesmo quando outra
-- policy já libera a linha, e `anon` não tem GRANT em `memberships`.
-- Fix: usar os helpers SECURITY DEFINER já existentes na plataforma
-- (is_admin_of_site / is_super_admin — mesmo padrão de site_tratamentos
-- e as demais tabelas de conteúdo), que bypassa o problema de grant.

GRANT SELECT, INSERT, UPDATE, DELETE ON contos TO authenticated;
GRANT SELECT ON contos TO anon;

CREATE OR REPLACE FUNCTION casos_agendados_publicos(p_site_id UUID)
RETURNS TABLE(numero INTEGER, titulo TEXT, data_publicacao TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT numero, titulo, data_publicacao
  FROM contos
  WHERE site_id = p_site_id AND publicado = true AND data_publicacao > now()
  ORDER BY numero ASC;
$$;

GRANT EXECUTE ON FUNCTION casos_agendados_publicos(UUID) TO anon, authenticated;

-- Bucket de imagens dos contos (público)
INSERT INTO storage.buckets (id, name, public) VALUES ('contos-imagens', 'contos-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Mesmo padrão de RLS do bucket site-fotos: escrita restrita ao admin
-- do site (primeiro segmento do path = site_id), leitura pública.
CREATE POLICY contos_imagens_owner_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contos-imagens' AND is_admin_of_site(((storage.foldername(name))[1])::uuid));
CREATE POLICY contos_imagens_owner_update ON storage.objects FOR UPDATE
  USING (bucket_id = 'contos-imagens' AND is_admin_of_site(((storage.foldername(name))[1])::uuid));
CREATE POLICY contos_imagens_owner_delete ON storage.objects FOR DELETE
  USING (bucket_id = 'contos-imagens' AND is_admin_of_site(((storage.foldername(name))[1])::uuid));
CREATE POLICY contos_imagens_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'contos-imagens');
