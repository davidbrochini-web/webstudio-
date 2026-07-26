-- ============================================================
-- 0012_site_servicos_preco.sql
--
-- O template Urbano (barbearia) mostra preço por serviço, mas hoje
-- é um array hardcoded dentro do componente, sem vir do tenant.
-- Adiciona coluna opcional — só o Urbano usa por enquanto, mas fica
-- disponível pra qualquer nicho futuro que precise de preço por item.
-- ============================================================

alter table site_servicos add column if not exists preco text;
