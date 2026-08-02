-- ============================================================
-- 0026_agendamento.sql
--
-- Módulo de Agendamento — Projeto Especial Dentista João (E1 do
-- checklist em PROJETO_ESPECIAL_DENTISTA_JOAO.md). Schema pensado
-- pra qualquer site (não amarrado a projeto_especial_slug), mesmo
-- espírito de site_tratamentos/equipe/cursos: reaproveitável por
-- projeto futuro sem migration de schema nova.
--
-- Decisões de produto já alinhadas (ver doc):
--   - paciente escolhe slot real (não formulário cego)
--   - sem login/senha pro paciente — consulta via e-mail + OTP
--   - cancelamento self-service, reagendamento só "solicita"
--   - fuso fixo America/Sao_Paulo (armazenado em date/time puro,
--     sem timestamptz — evita conversão de fuso em todo lugar;
--     app trata tudo como horário local do site)
--
-- Leitura pública dos SLOTS (não dos dados de paciente): em vez de
-- expor `agendamentos` pra anon (teria nome/telefone/e-mail de
-- outros pacientes), criamos uma função SECURITY DEFINER que
-- devolve só os intervalos ocupados (data/hora, sem paciente),
-- mesmo padrão de is_site_publicado/is_admin_of_site (definer +
-- search_path fixo). anon nunca tem SELECT direto em `agendamentos`.
-- ============================================================

-- ── agendamento_config — 1 linha por site ───────────────────────
create table agendamento_config (
  id                          uuid primary key default gen_random_uuid(),
  site_id                     uuid not null unique references sites(id) on delete cascade,
  duracao_slot_minutos        int not null default 30,
  intervalo_minutos           int not null default 0,
  antecedencia_minima_horas   int not null default 24,
  janela_maxima_dias          int not null default 60,
  max_pendentes_por_telefone  int not null default 2,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint agendamento_config_valores_positivos check (
    duracao_slot_minutos > 0 and intervalo_minutos >= 0
    and antecedencia_minima_horas >= 0 and janela_maxima_dias > 0
    and max_pendentes_por_telefone > 0
  )
);

-- ── agendamento_horarios — grade semanal de atendimento ─────────
-- dia_semana segue extract(dow): 0=domingo .. 6=sábado
create table agendamento_horarios (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  dia_semana   int not null check (dia_semana between 0 and 6),
  hora_inicio  time not null,
  hora_fim     time not null,
  ativo        boolean not null default true,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint agendamento_horarios_intervalo_valido check (hora_fim > hora_inicio)
);

-- ── agendamento_tipos_consulta ───────────────────────────────────
create table agendamento_tipos_consulta (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references sites(id) on delete cascade,
  nome              text not null,
  duracao_minutos   int not null check (duracao_minutos > 0),
  ativo             boolean not null default true,
  ordem             int not null default 0,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── agendamento_bloqueios — datas/horários fechados ──────────────
-- hora_inicio/hora_fim nulos = bloqueio de dia inteiro
create table agendamento_bloqueios (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  data         date not null,
  hora_inicio  time,
  hora_fim     time,
  motivo       text,

  created_at   timestamptz not null default now(),

  constraint agendamento_bloqueios_janela_consistente check (
    (hora_inicio is null and hora_fim is null)
    or (hora_inicio is not null and hora_fim is not null and hora_fim > hora_inicio)
  )
);

-- ── agendamentos ──────────────────────────────────────────────────
create table agendamentos (
  id                 uuid primary key default gen_random_uuid(),
  site_id            uuid not null references sites(id) on delete cascade,
  tipo_consulta_id   uuid references agendamento_tipos_consulta(id) on delete set null,

  data               date not null,
  hora_inicio        time not null,
  hora_fim           time not null,

  paciente_nome      text not null,
  paciente_telefone  text not null,
  paciente_email     text not null,
  mensagem           text,

  status             text not null default 'pendente'
                        check (status in ('pendente', 'confirmado', 'realizado', 'cancelado', 'falta')),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint agendamentos_intervalo_valido check (hora_fim > hora_inicio)
);

-- conflito de slot impedido no banco: 2 agendamentos não-cancelados
-- não podem ocupar o mesmo site/data/hora_inicio
create unique index agendamentos_slot_unico
  on agendamentos (site_id, data, hora_inicio)
  where status <> 'cancelado';

create index agendamentos_site_data_idx on agendamentos (site_id, data);
create index agendamentos_email_idx on agendamentos (paciente_email);
create index agendamentos_telefone_pendentes_idx on agendamentos (site_id, paciente_telefone)
  where status = 'pendente';

-- ── agendamento_codigos_otp ───────────────────────────────────────
-- Nunca exposta a anon/authenticated via RLS — só service_role (server
-- actions), mesmo espírito de exceção documentada de /demo/iniciar:
-- fluxo público do paciente passa por action com createAdminClient(),
-- não por acesso direto de tabela.
create table agendamento_codigos_otp (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references sites(id) on delete cascade,
  email        text not null,
  codigo_hash  text not null,
  expira_em    timestamptz not null,
  usado        boolean not null default false,

  created_at   timestamptz not null default now()
);

create index agendamento_otp_email_idx on agendamento_codigos_otp (site_id, email, created_at);

-- ── triggers de updated_at ────────────────────────────────────────
create trigger trg_agendamento_config_updated before update on agendamento_config
  for each row execute function set_updated_at();
create trigger trg_agendamento_horarios_updated before update on agendamento_horarios
  for each row execute function set_updated_at();
create trigger trg_agendamento_tipos_consulta_updated before update on agendamento_tipos_consulta
  for each row execute function set_updated_at();
create trigger trg_agendamentos_updated before update on agendamentos
  for each row execute function set_updated_at();

-- ── função pública de disponibilidade (sem dado de paciente) ─────
-- Devolve só os intervalos ocupados (não-cancelados) num range de
-- datas, pra anon calcular slots livres = grade (config+horarios)
-- − bloqueios − ocupados. security definer pra não precisar dar
-- select direto em `agendamentos` (que tem nome/telefone/e-mail).
create or replace function agendamento_slots_ocupados(
  p_site_id uuid,
  p_data_inicio date,
  p_data_fim date
) returns table (data date, hora_inicio time, hora_fim time) as $$
  select a.data, a.hora_inicio, a.hora_fim
  from agendamentos a
  where a.site_id = p_site_id
    and a.data between p_data_inicio and p_data_fim
    and a.status <> 'cancelado';
$$ language sql stable security definer set search_path = public, pg_temp;

-- ── RLS ────────────────────────────────────────────────────────────
alter table agendamento_config enable row level security;
alter table agendamento_horarios enable row level security;
alter table agendamento_tipos_consulta enable row level security;
alter table agendamento_bloqueios enable row level security;
alter table agendamentos enable row level security;
alter table agendamento_codigos_otp enable row level security;

-- config: sem dado sensível, anon lê pra saber antecedência/janela/
-- duração do slot; escrita só admin do site
create policy agendamento_config_select on agendamento_config for select
  using (true);
create policy agendamento_config_insert on agendamento_config for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_config_update on agendamento_config for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_config_delete on agendamento_config for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- horários: público só vê os ativos (pra montar a grade); painel
-- (membro/admin) vê tudo, inclusive inativos
create policy agendamento_horarios_select on agendamento_horarios for select
  using (is_member_of_site(site_id) or is_super_admin() or ativo = true);
create policy agendamento_horarios_insert on agendamento_horarios for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_horarios_update on agendamento_horarios for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_horarios_delete on agendamento_horarios for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- tipos de consulta: mesmo padrão — público só vê ativos
create policy agendamento_tipos_consulta_select on agendamento_tipos_consulta for select
  using (is_member_of_site(site_id) or is_super_admin() or ativo = true);
create policy agendamento_tipos_consulta_insert on agendamento_tipos_consulta for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_tipos_consulta_update on agendamento_tipos_consulta for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_tipos_consulta_delete on agendamento_tipos_consulta for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- bloqueios: sem dado de paciente, público precisa ver pra excluir
-- do cálculo de slots livres
create policy agendamento_bloqueios_select on agendamento_bloqueios for select
  using (true);
create policy agendamento_bloqueios_insert on agendamento_bloqueios for insert
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_bloqueios_update on agendamento_bloqueios for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamento_bloqueios_delete on agendamento_bloqueios for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- agendamentos: TEM dado de paciente — anon NUNCA tem select direto
-- (disponibilidade pública passa pela função definer acima). anon
-- só cria (status sempre 'pendente' na criação). Leitura completa e
-- mudança de status são só do painel (admin do site).
create policy agendamentos_select on agendamentos for select
  using (is_member_of_site(site_id) or is_super_admin());
create policy agendamentos_insert_publico on agendamentos for insert
  with check (status = 'pendente');
create policy agendamentos_update on agendamentos for update
  using (is_admin_of_site(site_id) or is_super_admin())
  with check (is_admin_of_site(site_id) or is_super_admin());
create policy agendamentos_delete on agendamentos for delete
  using (is_admin_of_site(site_id) or is_super_admin());

-- otp: nenhuma policy pra anon/authenticated de propósito — só
-- service_role (bypassa RLS por padrão) via server action grava e lê.
-- Painel (admin) também não precisa acessar isso diretamente.

-- ── grants ──────────────────────────────────────────────────────
-- authenticated/service_role herdam via default privileges (0004/0007).
-- anon precisa de SELECT explícito nas tabelas com policy pública, e
-- de INSERT em agendamentos pra criar solicitação de consulta.
grant select on agendamento_config, agendamento_horarios,
  agendamento_tipos_consulta, agendamento_bloqueios to anon;
grant select, insert on agendamentos to anon;
grant execute on function agendamento_slots_ocupados(uuid, date, date) to anon;

-- agendamento_codigos_otp: nenhum grant pra anon/authenticated —
-- só service_role (herdado do default privileges de 0007).

-- ── seed: config padrão pro tenant do Dentista João ──────────────
insert into agendamento_config (site_id, duracao_slot_minutos, intervalo_minutos,
    antecedencia_minima_horas, janela_maxima_dias, max_pendentes_por_telefone)
select s.id, 30, 0, 24, 60, 2
from sites s
join tenants t on t.id = s.tenant_id
where t.projeto_especial_slug = 'dentista-joao'
on conflict (site_id) do nothing;
