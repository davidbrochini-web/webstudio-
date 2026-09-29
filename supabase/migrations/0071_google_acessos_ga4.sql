-- ID da propriedade GA4 do cliente. Reaproveita o mesmo OAuth (client +
-- refresh_token) da linha do Google Ads — o token é gerado com os escopos
-- adwords + analytics.readonly. Aplicada em 29/09/2026.
ALTER TABLE public.google_ads_acessos ADD COLUMN IF NOT EXISTS ga4_property_id text;
