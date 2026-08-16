-- 0057_doc_ia.sql
-- Doc IA — documentação viva do projeto, mantida pelo Claude (via
-- Management API, que não passa por RLS) e lida pelo David no admin.
-- Substitui os MDs estáticos do projeto Claude como fonte primária de
-- continuidade entre sessões: o Claude lê esta tabela no início de
-- cada conversa e a atualiza quando o David pedir.
--
-- ACESSO: exclusivo do usuário David (auth.uid() fixo) — nem outros
-- super_admins enxergam. É deliberado: o doc contém detalhes internos
-- de infraestrutura/fluxo que não fazem parte do dia a dia comercial.

CREATE TABLE IF NOT EXISTS doc_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  conteudo text NOT NULL,
  atualizado_por text NOT NULL DEFAULT 'claude',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_doc_ia_updated ON doc_ia;
CREATE TRIGGER trg_doc_ia_updated BEFORE UPDATE ON doc_ia
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Histórico: toda atualização guarda a versão anterior — barato e
-- garante que nenhuma edição minha perde conteúdo sem rastro.
CREATE TABLE IF NOT EXISTS doc_ia_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id uuid NOT NULL REFERENCES doc_ia(id),
  conteudo text NOT NULL,
  atualizado_por text NOT NULL,
  versao_de timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.doc_ia_guardar_historico()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.conteudo IS DISTINCT FROM NEW.conteudo THEN
    INSERT INTO doc_ia_historico (doc_id, conteudo, atualizado_por, versao_de)
    VALUES (OLD.id, OLD.conteudo, OLD.atualizado_por, OLD.updated_at);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_doc_ia_historico ON doc_ia;
CREATE TRIGGER trg_doc_ia_historico BEFORE UPDATE ON doc_ia
  FOR EACH ROW EXECUTE FUNCTION doc_ia_guardar_historico();

-- RLS: só o usuário David (id fixo). Claude opera via Management API
-- (role postgres), que não passa por RLS — então isso protege
-- exclusivamente o acesso via app.
ALTER TABLE doc_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_ia_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS doc_ia_select_david ON doc_ia;
CREATE POLICY doc_ia_select_david ON doc_ia FOR SELECT
  USING (auth.uid() = 'b8035bb4-79ed-4996-9bc8-0b3ca345ef41'::uuid);

DROP POLICY IF EXISTS doc_ia_historico_select_david ON doc_ia_historico;
CREATE POLICY doc_ia_historico_select_david ON doc_ia_historico FOR SELECT
  USING (auth.uid() = 'b8035bb4-79ed-4996-9bc8-0b3ca345ef41'::uuid);

-- Sem policy de INSERT/UPDATE/DELETE de propósito: escrita só via
-- Management API (Claude). O app é leitura pura.
