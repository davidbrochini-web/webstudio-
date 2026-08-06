-- Bug encontrado em revisão: UNIQUE(site_id, slug) nessas 3 tabelas não
-- excluía linhas com soft-delete, então depois de "excluir" um item o
-- slug ficava permanentemente bloqueado (não dava pra reaproveitar nem
-- criar um novo item com o mesmo nome/URL). Efeito colateral real: o
-- cliente reaproveitou o registro de "Clareamento Dental" (slug
-- clareamento-dental) pra virar "Cirurgia Ortognática" em vez de criar
-- um item novo (porque o slug natural 'cirurgia-ortognatica' já estava
-- "ocupado" por uma versão antiga excluída) — resultado: a URL
-- /tratamentos/clareamento-dental mostra conteúdo de cirurgia
-- ortognática, sem relação com o nome da URL.
--
-- Fix: troca a UNIQUE constraint por um índice único parcial que só
-- considera linhas ativas (deleted_at is null) — exclusão libera o slug
-- de verdade.

alter table site_tratamentos drop constraint site_tratamentos_site_id_slug_key;
create unique index site_tratamentos_site_id_slug_ativo_key
  on site_tratamentos (site_id, slug) where deleted_at is null;

alter table site_cursos_eventos drop constraint site_cursos_eventos_site_id_slug_key;
create unique index site_cursos_eventos_site_id_slug_ativo_key
  on site_cursos_eventos (site_id, slug) where deleted_at is null;

alter table site_blog_posts drop constraint site_blog_posts_site_id_slug_key;
create unique index site_blog_posts_site_id_slug_ativo_key
  on site_blog_posts (site_id, slug) where deleted_at is null;

-- Corrige o dado incorreto encontrado: URL clareamento-dental mostrando
-- conteúdo de Cirurgia Ortognática. O slug antigo (do item excluído em
-- 03/08) já não conflita mais com o índice parcial acima.
update site_tratamentos
  set slug = 'cirurgia-ortognatica'
  where id = '2538387d-a777-4b61-bfba-ff3e1f3b5336'
    and slug = 'clareamento-dental'
    and deleted_at is null;
