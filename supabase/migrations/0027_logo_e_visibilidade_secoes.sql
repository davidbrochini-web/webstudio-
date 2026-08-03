-- ============================================================
-- 0027_logo_e_visibilidade_secoes.sql
--
-- Dois pedidos do cliente (Dentista João) via feedback de teste:
--
-- 1. Logo em PNG no lugar do nome escrito no menu do site
--    (sites.logo_url — nullable, se vazio continua mostrando o
--    nome em texto como hoje, sem quebrar nenhum tenant existente)
--
-- 2. Poder deixar qualquer seção do site "invisível" temporariamente
--    (esconde do menu, da prévia na Home e da página dedicada — sem
--    apagar o conteúdo, só oculta) pra alimentar aos poucos sem
--    ficar exposto. Pedido específico foi Cursos e Eventos, mas
--    pediu pra valer pra qualquer área — por isso um flag por seção
--    em vez de um botão só pra cursos.
-- ============================================================

alter table sites add column logo_url text;

alter table sites add column secao_tratamentos_visivel boolean not null default true;
alter table sites add column secao_cursos_visivel boolean not null default true;
alter table sites add column secao_equipe_visivel boolean not null default true;
alter table sites add column secao_faq_visivel boolean not null default true;
alter table sites add column secao_artigos_visivel boolean not null default true;
