-- 0042: Depoimentos de clientes — Dentista João.
--
-- IMPORTANTE: a tabela site_depoimentos já existia em produção quando
-- esta migration foi escrita — uma sessão concorrente criou a mesma
-- tabela (mesmo nome, mesmas 4 policies com qual/with_check idênticos,
-- mesmo trigger trg_site_depoimentos_updated) só que com schema
-- incompleto (faltavam cargo_ou_contexto, nota, foto_url, alt_text,
-- publicado) e 0 linhas. Por isso esta migration é toda em ALTER ...
-- IF NOT EXISTS em vez de CREATE TABLE — não derruba o que a outra
-- sessão criou, só completa.
--
-- GRANT explícito também aqui (aprendizado da 0041: policy sem grant
-- falha silenciosamente) — testado com a chave anon real antes de
-- considerar pronto.

alter table site_depoimentos add column if not exists cargo_ou_contexto text;
alter table site_depoimentos add column if not exists nota integer not null default 5;
alter table site_depoimentos add column if not exists foto_url text;
alter table site_depoimentos add column if not exists alt_text text;
alter table site_depoimentos add column if not exists publicado boolean not null default true;

do $$
begin
  if not exists (
    select 1 from information_schema.check_constraints
    where constraint_name = 'site_depoimentos_nota_check'
  ) then
    alter table site_depoimentos add constraint site_depoimentos_nota_check check (nota between 1 and 5);
  end if;
end $$;

create index if not exists site_depoimentos_site_ordem_idx
  on site_depoimentos (site_id, ordem) where deleted_at is null;

-- RLS e policies já existiam (criadas pela sessão concorrente) com o
-- mesmo padrão de site_equipe — reafirmadas aqui via DROP + CREATE só
-- pra ficar rastreável na migration, sem mudar o comportamento.
alter table site_depoimentos enable row level security;

drop policy if exists site_depoimentos_select on site_depoimentos;
create policy site_depoimentos_select on site_depoimentos for select
  using (is_member_of_site(site_id) or is_super_admin() or is_site_publicado(site_id));

drop policy if exists site_depoimentos_insert on site_depoimentos;
create policy site_depoimentos_insert on site_depoimentos for insert
  with check (is_admin_of_site(site_id) or is_super_admin());

drop policy if exists site_depoimentos_update on site_depoimentos;
create policy site_depoimentos_update on site_depoimentos for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());

drop policy if exists site_depoimentos_delete on site_depoimentos;
create policy site_depoimentos_delete on site_depoimentos for delete
  using (is_admin_of_site(site_id) or is_super_admin());

grant select on site_depoimentos to anon, authenticated;
grant insert, update, delete on site_depoimentos to authenticated;

alter table sites add column if not exists secao_depoimentos_visivel boolean not null default true;

-- Seed: 3 depoimentos de exemplo pro Dentista João. Guarda contra
-- reexecução (not exists) — a tabela pode já ter sido semeada por
-- outra sessão ou execução anterior desta mesma migration.
insert into site_depoimentos (site_id, nome, cargo_ou_contexto, texto, nota, ordem)
select * from (values
  ('f3cdb729-2698-485d-a49a-f3e26767b934'::uuid, 'Mariana Costa', 'Paciente de implante', 'Fiz meu implante com o Dr. João e o resultado superou minhas expectativas. Explicação clara em cada etapa e recuperação muito mais tranquila do que eu imaginava.', 5, 0),
  ('f3cdb729-2698-485d-a49a-f3e26767b934'::uuid, 'Ricardo Alves', 'Paciente de cirurgia ortognática', 'Passei anos adiando a cirurgia por medo. O Dr. João teve muita paciência pra explicar tudo, e hoje eu recomendo o trabalho dele pra qualquer pessoa na mesma situação.', 5, 1),
  ('f3cdb729-2698-485d-a49a-f3e26767b934'::uuid, 'Fernanda Lima', 'Paciente de extração de siso', 'Atendimento excelente do início ao fim. Equipe atenciosa, ambiente tranquilo e o procedimento foi bem mais rápido do que eu esperava.', 5, 2)
) as seed(site_id, nome, cargo_ou_contexto, texto, nota, ordem)
where not exists (
  select 1 from site_depoimentos where site_id = 'f3cdb729-2698-485d-a49a-f3e26767b934'
);
