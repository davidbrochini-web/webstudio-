-- ============================================================
-- 0010_storage_site_fotos.sql
--
-- Bucket de Storage pra upload real de fotos de site (antes só
-- aceitava colar URL externa). Convenção de path obrigatória:
-- `{site_id}/{arquivo}` — a policy de escrita usa o primeiro
-- segmento do path como site_id e valida via is_admin_of_site().
--
-- Bucket público pra leitura (fotos de site não são dado sensível
-- e precisam carregar rápido via CDN sem round-trip de auth) — só
-- escrita/exclusão é restrita.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('site-fotos', 'site-fotos', true)
on conflict (id) do nothing;

create policy site_fotos_public_read on storage.objects for select
  using (bucket_id = 'site-fotos');

create policy site_fotos_owner_insert on storage.objects for insert
  with check (
    bucket_id = 'site-fotos'
    and is_admin_of_site((storage.foldername(name))[1]::uuid)
  );

create policy site_fotos_owner_delete on storage.objects for delete
  using (
    bucket_id = 'site-fotos'
    and is_admin_of_site((storage.foldername(name))[1]::uuid)
  );

create policy site_fotos_owner_update on storage.objects for update
  using (
    bucket_id = 'site-fotos'
    and is_admin_of_site((storage.foldername(name))[1]::uuid)
  );
