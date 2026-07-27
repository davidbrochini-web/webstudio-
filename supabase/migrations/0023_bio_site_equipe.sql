-- ============================================================
-- 0023_bio_site_equipe.sql
--
-- Achado navegando o site de referência (drfabiosato.com.br/equipe/):
-- a página de equipe tem uma bio longa por profissional (trajetória,
-- credencial tipo CROSP), não só formação/especialidade curtas.
-- Faltava esse campo no site_equipe.
-- ============================================================

alter table site_equipe add column bio text;
