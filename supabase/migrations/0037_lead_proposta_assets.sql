-- ============================================================
-- 0037_lead_proposta_assets.sql
--
-- Campos pra prospecção: o comercial faz upload do logo e de
-- algumas fotos do portfólio do lead (tiradas do Instagram dele,
-- por exemplo), e esses arquivos alimentam a geração automática do
-- PDF de proposta (mockup de "como o site pode ficar").
--
-- logo: uma imagem só.
-- portfólio: várias imagens — array de URLs, mais simples que criar
-- tabela filha pra um caso de uso que não precisa de metadata extra
-- por imagem (não tem legenda, ordem editável, etc. por enquanto).
-- ============================================================

alter table leads_omnidesign add column logo_url text;
alter table leads_omnidesign add column imagens_portfolio text[] not null default '{}';

comment on column leads_omnidesign.logo_url is 'Logo do lead, upload pelo comercial (bucket leads-imagens). Usado no mockup do PDF de proposta.';
comment on column leads_omnidesign.imagens_portfolio is 'Fotos do portfólio do lead (ex: prints do Instagram), upload pelo comercial. Array de URLs do bucket leads-imagens, até 6 usadas no mockup.';

-- Bucket de imagens de lead — mesmo espírito do leads-pdfs (privado,
-- só super-admin), diferente dos buckets públicos da plataforma
-- (site-fotos, contos-imagens, perfil-fotos): isso é material de
-- prospecção, não conteúdo de site publicado.
insert into storage.buckets (id, name, public)
values ('leads-imagens', 'leads-imagens', false)
on conflict (id) do nothing;

create policy leads_imagens_admin_select on storage.objects for select
  using (bucket_id = 'leads-imagens' and is_super_admin());

create policy leads_imagens_admin_insert on storage.objects for insert
  with check (bucket_id = 'leads-imagens' and is_super_admin());

create policy leads_imagens_admin_update on storage.objects for update
  using (bucket_id = 'leads-imagens' and is_super_admin());

create policy leads_imagens_admin_delete on storage.objects for delete
  using (bucket_id = 'leads-imagens' and is_super_admin());
