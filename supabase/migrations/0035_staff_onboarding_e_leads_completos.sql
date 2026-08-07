-- ============================================================
-- 0035_staff_onboarding_e_leads_completos.sql
--
-- Duas frentes pedidas pelo David na mesma sessão:
--
-- 1) Onboarding de equipe: quando David cria um login novo pra
--    alguém da equipe (ex: Andressa), a pessoa é obrigada a trocar
--    a senha no primeiro acesso, e é convidada (opcional) a subir
--    uma foto de perfil — pensada pra assinatura de e-mail no
--    futuro, mas já usada como avatar na navbar desde já.
--
-- 2) Leads potenciais completos: telefone/email separados (além do
--    `contato` genérico que já existia pra leads de origem=site),
--    texto de envio (rascunho de mensagem/proposta) e upload de
--    2 PDFs (análise e proposta) — bucket próprio, privado.
-- ============================================================

-- ── 1) Onboarding de equipe ─────────────────────────────────

alter table profiles add column must_change_password boolean not null default false;
alter table profiles add column foto_perfil_url text;

comment on column profiles.must_change_password is
  'Se true, força troca de senha no próximo login antes de liberar qualquer área protegida (ver /primeiro-acesso e proxy.ts). Usado pra contas criadas pelo super-admin pra outras pessoas da equipe.';
comment on column profiles.foto_perfil_url is
  'Foto de perfil, upload opcional oferecido no primeiro acesso (bucket perfil-fotos). Usada como avatar na navbar e futuramente em assinatura de e-mail.';

-- Bucket de fotos de perfil — público pra leitura (avatar na navbar
-- não pode depender de round-trip de auth), escrita restrita ao
-- próprio dono (path {user_id}/...), mesmo espírito de site-fotos.
insert into storage.buckets (id, name, public)
values ('perfil-fotos', 'perfil-fotos', true)
on conflict (id) do nothing;

create policy perfil_fotos_public_read on storage.objects for select
  using (bucket_id = 'perfil-fotos');

create policy perfil_fotos_owner_insert on storage.objects for insert
  with check (
    bucket_id = 'perfil-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy perfil_fotos_owner_update on storage.objects for update
  using (
    bucket_id = 'perfil-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2) Leads potenciais completos ───────────────────────────

alter table leads_omnidesign add column telefone text;
alter table leads_omnidesign add column email text;
alter table leads_omnidesign add column texto_envio text;
alter table leads_omnidesign add column analise_pdf_url text;
alter table leads_omnidesign add column proposta_pdf_url text;

comment on column leads_omnidesign.telefone is 'Telefone/WhatsApp do lead potencial (origem=manual). Leads de origem=site continuam usando o campo contato.';
comment on column leads_omnidesign.email is 'E-mail do lead potencial (origem=manual).';
comment on column leads_omnidesign.texto_envio is 'Rascunho da mensagem/proposta que será enviada ao lead — editável, não é enviado automaticamente.';
comment on column leads_omnidesign.analise_pdf_url is 'PDF de análise do lead, upload no bucket leads-pdfs (privado).';
comment on column leads_omnidesign.proposta_pdf_url is 'PDF de proposta enviada ao lead, upload no bucket leads-pdfs (privado).';

-- Bucket de PDFs de lead — PRIVADO (documento comercial interno,
-- diferente de site-fotos/contos-imagens/perfil-fotos que são
-- públicos). Só super-admin lê e escreve.
insert into storage.buckets (id, name, public)
values ('leads-pdfs', 'leads-pdfs', false)
on conflict (id) do nothing;

create policy leads_pdfs_admin_select on storage.objects for select
  using (bucket_id = 'leads-pdfs' and is_super_admin());

create policy leads_pdfs_admin_insert on storage.objects for insert
  with check (bucket_id = 'leads-pdfs' and is_super_admin());

create policy leads_pdfs_admin_update on storage.objects for update
  using (bucket_id = 'leads-pdfs' and is_super_admin());

create policy leads_pdfs_admin_delete on storage.objects for delete
  using (bucket_id = 'leads-pdfs' and is_super_admin());
