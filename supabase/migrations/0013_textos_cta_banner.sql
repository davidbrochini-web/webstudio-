-- ============================================================
-- 0013_textos_cta_banner.sql
--
-- Todos os 7 templates tinham textos hardcoded na seção de CTA
-- final (ex: "Agende sua avaliação", "Vem fazer parte!") e o Zen
-- tinha uma frase de banner no meio da página que o cliente não
-- podia mudar. Viram campos editáveis do site.
-- ============================================================

alter table sites add column if not exists cta_heading text;
alter table sites add column if not exists cta_subtext text;
alter table sites add column if not exists banner_text text;
