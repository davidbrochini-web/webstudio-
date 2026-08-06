-- ============================================================
-- 0028_seo_indexavel.sql
--
-- Move o "kill-switch" de indexação (antes uma constante fixa no
-- código, SITE_INDEXAVEL) pra um campo de banco controlável pelo
-- painel — nasce da aba SEO nova do admin. Default false: continua
-- exatamente com o comportamento de hoje (noindex) até alguém
-- decidir ligar pelo painel. Não é decisão técnica, é decisão de
-- "o conteúdo já tá pronto pra aparecer no Google" — por isso vira
-- um toggle visível, não um redeploy.
-- ============================================================

alter table sites add column seo_indexavel boolean not null default false;
