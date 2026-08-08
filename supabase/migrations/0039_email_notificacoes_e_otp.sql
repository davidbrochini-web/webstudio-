-- 0039: Disparo de e-mail (Resend) — Projeto Especial Dentista João.
--
-- sites.email_notificacoes já existia em produção (adicionada fora do
-- fluxo de migration por outra sessão, sem arquivo correspondente aqui
-- — `add column if not exists` só formaliza o que já está lá, é
-- idempotente e não altera o valor já configurado).
--
-- otp_codigos é nova: substitui o código fixo "000000" de
-- "Meus Agendamentos" por um código real de 6 dígitos, enviado por
-- e-mail, com expiração. Validação só via RPC SECURITY DEFINER
-- (verificar_otp_codigo) — não existe policy de SELECT pra
-- anon/authenticated, então o código não é legível por consulta
-- direta à tabela, só validável um de cada vez.

alter table sites add column if not exists email_notificacoes text;

create table if not exists otp_codigos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  email text not null,
  codigo text not null,
  expira_em timestamptz not null,
  usado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists otp_codigos_site_email_idx
  on otp_codigos (site_id, email, created_at desc);

alter table otp_codigos enable row level security;

-- Insert liberado pra qualquer um (mesmo padrão de site_leads /
-- agendamentos) — gerar um código não expõe nada sensível, quem lê é
-- só a própria RPC.
drop policy if exists otp_codigos_insert_public on otp_codigos;
create policy otp_codigos_insert_public on otp_codigos
  for insert to anon, authenticated
  with check (true);

-- Sem policy de SELECT/UPDATE/DELETE pra anon/authenticated de
-- propósito — toda leitura/consumo passa pela RPC abaixo.

create or replace function verificar_otp_codigo(p_site_id uuid, p_email text, p_codigo text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from otp_codigos
  where site_id = p_site_id
    and email = lower(p_email)
    and codigo = p_codigo
    and usado = false
    and expira_em > now()
  order by created_at desc
  limit 1;

  if v_id is null then
    return false;
  end if;

  update otp_codigos set usado = true where id = v_id;
  return true;
end;
$$;

grant execute on function verificar_otp_codigo(uuid, text, text) to anon, authenticated;

-- Configura o e-mail de notificação do Dentista João (já estava assim
-- em produção — reafirmando aqui pra ficar rastreável na migration).
update sites set email_notificacoes = 'david.brochini@gmail.com'
where slug = 'dentista-joao' and email_notificacoes is null;
