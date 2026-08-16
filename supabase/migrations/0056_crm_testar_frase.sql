-- 0056_crm_testar_frase.sql
-- CRM Omnidesign — Fase 4 (curadoria): função read-only que mostra
-- quais padrões do dicionário disparariam pra uma frase, SEM gravar
-- hit nenhum. Usada pelo testador da tela de curadoria — valida um
-- padrão novo (ou investiga um falso positivo) antes de mexer no
-- dicionário, sem sujar a análise de nenhum lead.

CREATE OR REPLACE FUNCTION public.testar_frase_dicionario(p_texto text, p_direcao text)
RETURNS TABLE(
  dicionario_id uuid,
  categoria text,
  subtipo text,
  padrao text,
  tipo_match text,
  peso integer,
  dica_atendente text,
  resposta_recomendada text
)
LANGUAGE sql
STABLE
AS $$
  SELECT d.id, d.categoria, d.subtipo, d.padrao, d.tipo_match, d.peso, d.dica_atendente, d.resposta_recomendada
  FROM crm_dicionario d
  WHERE d.ativo = true
    AND (d.direcao_alvo = p_direcao OR d.direcao_alvo = 'ambas')
    AND (
      (d.tipo_match = 'ilike' AND unaccent(trim(p_texto)) ILIKE ('%' || unaccent(d.padrao) || '%'))
      OR (d.tipo_match = 'similaridade' AND similarity(unaccent(trim(p_texto)), unaccent(d.padrao)) > 0.3)
    )
  ORDER BY d.categoria, d.subtipo;
$$;
