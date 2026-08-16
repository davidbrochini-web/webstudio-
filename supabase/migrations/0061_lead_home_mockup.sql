-- ============================================================
-- 0061_lead_home_mockup.sql
--
-- Página 4 da proposta ("Como a home pode ficar") já existia com
-- montagem automática (logo + fotos do portfólio, ver
-- components/pdf/PropostaDocument.tsx). Agora ganha uma alternativa:
-- o atendente pode montar o mockup à mão (Canva, Figma, o que for)
-- e subir como JPG pronto — nesse caso a página usa a imagem direto
-- em vez da montagem automática.
-- ============================================================

alter table leads_omnidesign add column if not exists home_mockup_url text;

comment on column leads_omnidesign.home_mockup_url is
  'JPG pronto de como a home pode ficar, montado manualmente pelo atendente (opcional). Quando preenchido, a página 4 da proposta usa essa imagem em vez de montar automaticamente com logo_url + imagens_portfolio.';
