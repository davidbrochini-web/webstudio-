-- ============================================================================
-- 0040 — Proteção de escalação de privilégio em profiles
-- ============================================================================
-- CONTEXTO (auditoria de isolamento entre tenants):
-- A policy `profiles_update_own` tinha `USING (id = auth.uid())` mas SEM
-- `WITH CHECK` restringindo COLUNAS. Resultado: qualquer usuário-cliente
-- autenticado (ex: o login do Colégio Elite) conseguia rodar
--   update profiles set is_super_admin = true where id = <próprio id>
-- e virar super_admin. Como super_admin enxerga os dados de TODOS os
-- tenants (várias policies têm `... OR is_super_admin()`), isso furava
-- completamente o isolamento entre projetos especiais — um cliente
-- poderia ver leads/agendamentos de outro. Falha crítica.
--
-- CORREÇÃO: trigger BEFORE UPDATE que bloqueia a mudança da coluna
-- is_super_admin (e do id) por quem não é super_admin. Trigger em vez de
-- só ajustar a policy porque cobre TODOS os caminhos de UPDATE (defesa em
-- profundidade), não só o caminho da policy específica. O service_role
-- (auth.uid() null) e super_admins legítimos continuam podendo alterar —
-- então o onboarding de staff e a gestão de super admins pelo painel /admin
-- seguem funcionando. Troca de nome/foto/senha do próprio perfil pelo
-- cliente também continua normal (só as colunas sensíveis são travadas).

create or replace function public.protect_profile_privilege()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if (new.is_super_admin is distinct from old.is_super_admin)
     and auth.uid() is not null
     and not coalesce((select is_super_admin from profiles where id = auth.uid()), false)
  then
    raise exception 'Alteração de privilégio não permitida.';
  end if;

  if new.id is distinct from old.id then
    raise exception 'Alteração de id não permitida.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privilege on public.profiles;
create trigger trg_protect_profile_privilege
  before update on public.profiles
  for each row execute function public.protect_profile_privilege();
