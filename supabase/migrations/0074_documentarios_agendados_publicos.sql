-- Arquivos do Observador: "pré-mostrar" documentários agendados (card selado),
-- igual a casos_agendados_publicos dos contos. Expõe só metadados do card —
-- nunca texto_html, resumo ou imagem. A RLS de documentarios continua
-- escondendo o conteúdo até data_publicacao.
CREATE OR REPLACE FUNCTION public.documentarios_agendados_publicos(p_site_id uuid)
RETURNS TABLE(numero integer, titulo text, local_caso text, ano_caso integer, data_publicacao timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT numero, titulo, local_caso, ano_caso, data_publicacao
  FROM documentarios
  WHERE site_id = p_site_id AND publicado = true AND data_publicacao > now()
  ORDER BY numero ASC;
$function$;

REVOKE ALL ON FUNCTION public.documentarios_agendados_publicos(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.documentarios_agendados_publicos(uuid) TO anon, authenticated;
