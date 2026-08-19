-- 0042: Depoimentos de clientes — Dentista João.
--
-- Mesmo padrão de site_equipe (RLS via is_admin_of_site/is_super_admin/
-- is_member_of_site/is_site_publicado, trigger set_updated_at, soft
-- delete). Diferente de site_equipe: tem `publicado` por item (como
-- site_tratamentos/site_cursos_eventos) — permite esconder um
-- depoimento sem apagar, além do toggle de seção inteira.
--
-- GRANT explícito nesta migration (aprendizado da 0041: policy sem
-- grant = 42501 antes do RLS ser avaliado) — testado com a chave anon
-- real antes de considerar pronto.

create table site_depoimentos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  nome text not null,
  cargo_ou_contexto text,
  texto text not null,
  nota integer not null default 5 check (nota between 1 and 5),
  foto_url text,
  alt_text text,
  ordem integer not null default 0,
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz
);

create index site_depoimentos_site_ordem_idx
  on site_depoimentos (site_id, ordem) where deleted_at is null;

create trigger trg_site_depoimentos_updated
  before update on site_depoimentos
  for each row execute function set_updated_at();

alter table site_depoimentos enable row level security;

create policy site_depoimentos_select on site_depoimentos for select
  using (is_member_of_site(site_id) or is_super_admin() or is_site_publicado(site_id));
create policy site_depoimentos_insert on site_depoimentos for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_depoimentos_update on site_depoimentos for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy site_depoimentos_delete on site_depoimentos for delete
  using (is_admin_of_site(site_id) or is_super_admin());

grant select on site_depoimentos to anon, authenticated;
grant insert, update, delete on site_depoimentos to authenticated;

alter table sites add column if not exists secao_depoimentos_visivel boolean not null default true;

-- Seed: 3 depoimentos de exemplo pro Dentista João, pra ele ver a
-- seção funcionando de imediato e decidir se edita, apaga ou mantém.
insert into site_depoimentos (site_id, nome, cargo_ou_contexto, texto, nota, ordem)
values
  ('f3cdb729-2698-485d-a49a-f3e26767b934', 'Mariana Costa', 'Paciente de implante', 'Fiz meu implante com o Dr. João e o resultado superou minhas expectativas. Explicação clara em cada etapa e recuperação muito mais tranquila do que eu imaginava.', 5, 0),
  ('f3cdb729-2698-485d-a49a-f3e26767b934', 'Ricardo Alves', 'Paciente de cirurgia ortognática', 'Passei anos adiando a cirurgia por medo. O Dr. João teve muita paciência pra explicar tudo, e hoje eu recomendo o trabalho dele pra qualquer pessoa na mesma situação.', 5, 1),
  ('f3cdb729-2698-485d-a49a-f3e26767b934', 'Fernanda Lima', 'Paciente de extração de siso', 'Atendimento excelente do início ao fim. Equipe atenciosa, ambiente tranquilo e o procedimento foi bem mais rápido do que eu esperava.', 5, 2);
