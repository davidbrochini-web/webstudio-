-- Arquivos do Observador: segunda linha editorial do Casos Esquecidos
-- (documentários de casos reais, narrados pelo Observador).
-- Tabela própria em vez de coluna `linha` em `contos`: formato, numeração,
-- SEO e metadados (caso/ano/local/palavras-chave) são diferentes, e isolar
-- evita regressão em todas as queries já existentes de contos.
CREATE TABLE IF NOT EXISTS public.documentarios (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  numero integer NOT NULL,
  titulo text NOT NULL,
  slug text NOT NULL,
  caso text NOT NULL,                 -- nome canônico do caso real (ex.: "Incidente do Passo Dyatlov")
  ano_caso integer NOT NULL,          -- ano do acontecimento (linha editorial: > 50 anos)
  local_caso text NOT NULL,           -- local do acontecimento
  resumo text NOT NULL,
  texto_html text NOT NULL,
  imagem_url text,
  imagem_alt text,
  tempo_leitura text,
  palavras_chave text[] NOT NULL DEFAULT '{}',
  publicado boolean NOT NULL DEFAULT false,
  data_publicacao timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, numero),
  UNIQUE (site_id, slug),
  CONSTRAINT documentarios_caso_antigo CHECK (ano_caso <= 1976)
);
CREATE INDEX IF NOT EXISTS idx_documentarios_site_pub ON public.documentarios (site_id, publicado, data_publicacao);
CREATE INDEX IF NOT EXISTS idx_documentarios_palavras ON public.documentarios USING gin (palavras_chave);

ALTER TABLE public.documentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY documentarios_select ON public.documentarios FOR SELECT
  USING (is_admin_of_site(site_id) OR is_super_admin() OR (publicado = true AND data_publicacao <= now()));
CREATE POLICY documentarios_insert ON public.documentarios FOR INSERT
  WITH CHECK (is_admin_of_site(site_id) OR is_super_admin());
CREATE POLICY documentarios_update ON public.documentarios FOR UPDATE
  USING (is_admin_of_site(site_id) OR is_super_admin());
CREATE POLICY documentarios_delete ON public.documentarios FOR DELETE
  USING (is_admin_of_site(site_id) OR is_super_admin());

CREATE TRIGGER trg_documentarios_updated_at BEFORE UPDATE ON public.documentarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Grants explícitos (o projeto não tem default privileges para tabelas
-- novas em public). Mesmo conjunto de `contos`; RLS continua decidindo o que cada papel enxerga.
GRANT SELECT ON public.documentarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentarios TO authenticated;
GRANT ALL ON public.documentarios TO service_role;
