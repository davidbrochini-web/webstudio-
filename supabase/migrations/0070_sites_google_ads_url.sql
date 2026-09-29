-- Link direto pras campanhas no Google Ads, exibido na aba Google do painel
-- do cliente (ao lado de Analytics e Search Console). Aplicada em 29/09/2026.
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS google_ads_url text;

-- Meta description própria do site (home). Antes a home usava `tagline`,
-- que é texto institucional longo exibido na página (452 caracteres no
-- dentista) — o Google corta em ~155 e a mesma frase se repetia em /a-clinica.
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS seo_descricao text;
