-- 0046: Nível de acesso da equipe interna (super_admin vs admin_nivel_1).
-- Não mexe em is_super_admin nem nas policies de RLS existentes — a
-- visibilidade de dado continua igual pros dois níveis (quem tem
-- is_super_admin=true "vê tudo" como já era). O que muda é um guard
-- NOVO, mais estrito, pra ações administrativas específicas (hoje:
-- gerenciar a própria equipe/criar login novo). Extensível: outras
-- ações sensíveis no futuro só precisam checar nivel_acesso também.

alter table profiles
  add column if not exists nivel_acesso text not null default 'admin_nivel_1'
  check (nivel_acesso in ('super_admin', 'admin_nivel_1'));

-- Quem já é super_admin vira nivel_acesso='super_admin' automaticamente
-- (preserva o estado atual — ninguém perde acesso com essa migration).
update profiles set nivel_acesso = 'super_admin' where is_super_admin = true;

-- Exceção: Eliane mantém is_super_admin=true (ela "vê tudo", pedido
-- explícito do David) mas nivel_acesso volta pra admin_nivel_1 —
-- ela não pode gerenciar a equipe (criar/editar outros logins).
update profiles set nivel_acesso = 'admin_nivel_1'
where id = (select id from auth.users where email = 'eliane@omnidesign.dev');

create or replace function pode_gerenciar_equipe()
returns boolean as $$
  select coalesce(
    (select nivel_acesso = 'super_admin' from profiles where id = auth.uid()),
    false
  );
$$ language sql security definer set search_path = public, pg_temp stable;
