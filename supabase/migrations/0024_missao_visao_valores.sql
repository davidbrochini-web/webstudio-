-- ============================================================
-- 0024_missao_visao_valores.sql
-- Torna Missão/Visão/Valores editáveis pelo cliente do projeto
-- especial. Antes eram texto de exemplo fixo no código da página
-- "A Clínica" — agora vêm do banco, editáveis no live editor.
--
-- valores fica como texto simples (uma linha por item) em vez de
-- array — mais fácil de editar num textarea comum sem UI extra de
-- lista, e a página divide por quebra de linha na hora de exibir.
-- ============================================================

alter table sites add column if not exists missao   text;
alter table sites add column if not exists visao    text;
alter table sites add column if not exists valores  text;
