-- ============================================================
-- 0025_detalhe_rico_tratamentos_cursos.sql
--
-- Tratamentos: página de detalhe era só um parágrafo corrido
-- (descricao_completa). Adiciona campos estruturados pra ficar
-- mais informativa — benefícios (lista), duração e indicação.
--
-- Cursos e Eventos: NÃO tinha separação entre o texto do card
-- (frente) e o texto da página de detalhe — os dois usavam a
-- mesma coluna `descricao`. Adiciona `descricao_completa` pra
-- seguir o mesmo padrão de site_tratamentos (descricao = resumo
-- do card, descricao_completa = texto da página de detalhe).
-- ============================================================

alter table site_tratamentos add column if not exists beneficios     text; -- um por linha
alter table site_tratamentos add column if not exists duracao        text; -- ex: "40 minutos por sessão"
alter table site_tratamentos add column if not exists indicado_para  text;

alter table site_cursos_eventos add column if not exists descricao_completa text;
