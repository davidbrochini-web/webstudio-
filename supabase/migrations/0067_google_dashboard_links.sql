-- Módulo "Google" no painel de Projetos Especiais — pedido David 06/09/2026.
-- Genérico pra qualquer site/cliente (não é específico do dentista-joao):
-- 3 links externos (Analytics, Search Console, Google Meu Negócio) + resumo
-- de campanhas Google Ads (esse último via google_ads_acessos, já existente).

ALTER TABLE sites
  ADD COLUMN google_analytics_url text,
  ADD COLUMN google_search_console_url text,
  ADD COLUMN google_meu_negocio_url text;

COMMENT ON COLUMN sites.google_analytics_url IS 'Link direto pro GA4 do cliente (opcional, botão no módulo Google do painel)';
COMMENT ON COLUMN sites.google_search_console_url IS 'Link direto pro Search Console do cliente (opcional, botão no módulo Google do painel)';
COMMENT ON COLUMN sites.google_meu_negocio_url IS 'Link direto pro Google Meu Negócio do cliente (opcional, botão no módulo Google do painel)';
