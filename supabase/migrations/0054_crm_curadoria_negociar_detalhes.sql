-- 0054_crm_curadoria_negociar_detalhes.sql
-- CRM Omnidesign — curadoria real (Fase 4 do blueprint, "iteração
-- contínua"), a partir de uma conversa de teste do próprio David:
--
-- 1. Atendente respondeu "podemos negociar, dependendo do que você
--    quer" pra uma objeção de preço. Isso É desconto por conta própria
--    (mesma categoria de erro que "consigo baixar"/"desconto de"), mas
--    o dicionário só tinha frases com a palavra "desconto" explícita —
--    "negociar" é um eufemismo comum que passava batido.
-- 2. "pode me dar mais detalhes?" é claramente uma pergunta de
--    descoberta (mesmo espírito de "me conta"/"como funciona hoje"),
--    mas não tinha padrão pra isso.

INSERT INTO crm_dicionario (categoria, subtipo, padrao, tipo_match, peso, direcao_alvo, resposta_recomendada, dica_atendente)
SELECT 'atendente_erro', 'desconto_proprio', padrao_novo, 'ilike', -20, 'enviada',
       'Desconto/negociação de preço é decisão do gestor — escalar antes de prometer qualquer coisa.',
       '🚨 Negociar preço por conta própria — escalar antes de oferecer'
FROM unnest(ARRAY['negociar', 'vamos ver um valor', 'consigo fazer por', 'ajustar o valor']) AS padrao_novo
WHERE NOT EXISTS (
  SELECT 1 FROM crm_dicionario WHERE categoria='atendente_erro' AND subtipo='desconto_proprio' AND padrao = padrao_novo
);

INSERT INTO crm_dicionario (categoria, subtipo, padrao, tipo_match, peso, direcao_alvo)
SELECT 'atendente_acerto', 'pergunta_descoberta', padrao_novo, 'ilike', 10, 'enviada'
FROM unnest(ARRAY['mais detalhes', 'me explica melhor', 'como você imagina']) AS padrao_novo
WHERE NOT EXISTS (
  SELECT 1 FROM crm_dicionario WHERE categoria='atendente_acerto' AND subtipo='pergunta_descoberta' AND padrao = padrao_novo
);
