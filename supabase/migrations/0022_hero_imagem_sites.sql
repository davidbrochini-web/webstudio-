-- ============================================================
-- 0022_hero_imagem_sites.sql
--
-- Faltava um campo pra foto de destaque do hero — o handoff do
-- Projeto Especial #1 pede explicitamente "hero com foto do
-- profissional", e nenhum template (catálogo nem projeto especial)
-- tinha esse campo. Genérico o suficiente pra qualquer site usar,
-- não só o dentista-joao.
-- ============================================================

alter table sites add column hero_imagem_url text;
