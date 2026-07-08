# Migrations — Supabase

Schema multi-tenant do webstudio. Aplique nesta ordem, no **SQL Editor** do
Supabase (Project → SQL Editor → New query), uma migration por vez:

1. `0001_core_platform.sql` — tenants, profiles, memberships, subscriptions
2. `0002_cadastros.sql` — funcionários, produtos/serviços, clientes, fornecedores
3. `0003_cadastros_rls.sql` — políticas de acesso do módulo de cadastros

Todas foram testadas localmente (Postgres 16, aplicação limpa + testes de
isolamento) antes de entrar aqui.

---

## Como funciona o isolamento multi-tenant

Cada tabela de dado (clientes, funcionários, etc.) tem uma coluna `tenant_id`.
O RLS (Row-Level Security) do Postgres garante, **no banco**, que um usuário
só enxerga e só edita linhas do(s) tenant(s) onde ele tem `membership`. Isso
vale mesmo que exista um bug no código do app — a barreira é no banco, não
na aplicação.

**Papéis (`memberships.papel`):**
- `owner` / `admin` → podem ler, criar, editar e excluir
- `operador` → só pode ler (ajustamos por módulo se precisar de mais controle)

**Super-admin (você):** `profiles.is_super_admin = true` — enxerga e edita
qualquer tenant, sem precisar de membership. É assim que o seu painel de
dono da agência funciona.

---

## Soft-delete: por que `deleted_at` NÃO está no RLS

Decisão técnica importante — documento aqui para não repetir o erro depois.

Tentei inicialmente colocar `deleted_at is null` dentro da política de
SELECT, pensando em esconder registros "excluídos" automaticamente. **Isso
quebra o UPDATE que faz o soft-delete.** O Postgres exige que, num UPDATE,
tanto a política de SELECT quanto a de UPDATE sejam satisfeitas juntas (com
AND) — inclusive na linha *resultante*. Como marcar `deleted_at = now()`
faz a linha deixar de bater com `deleted_at is null`, o próprio Postgres
bloqueia a operação de apagar.

**Correção:** RLS cuida só de segurança (tenant certo, papel certo).
Esconder registro excluído é regra de negócio, não de segurança — então
todo `SELECT` feito pela aplicação precisa incluir `.is('deleted_at', null)`
explicitamente. Exemplo com o client do Supabase:

```ts
const { data } = await supabase
  .from('clientes')
  .select('*')
  .eq('tenant_id', tenantId)
  .is('deleted_at', null)   // <- sempre incluir isso nas listagens
```

---

## Testando localmente antes de aplicar em produção

Se quiser reproduzir os testes que rodei:

```bash
createdb webstudio_test
psql -d webstudio_test -f 0001_core_platform.sql
psql -d webstudio_test -f 0002_cadastros.sql
psql -d webstudio_test -f 0003_cadastros_rls.sql
```

As migrations criam um stub de `auth.users`/`auth.uid()` só para permitir
testar localmente — em produção o Supabase já fornece isso de verdade,
então **não rode isso via Supabase SQL Editor caso o schema `auth` já
exista** (ele vai existir sempre no Supabase — o `create schema if not
exists auth` é seguro nesse caso, só não vai recriar nada).

---

## Próximos módulos

Depois que Cadastros estiver validado no Supabase real, os módulos
seguintes (Contas a Pagar/Receber, Estoque, CRM) entram como novas
migrations numeradas (`0004_...`), sempre referenciando `tenants(id)`,
`clientes(id)`, `fornecedores(id)` e `produtos_servicos(id)` já existentes
— sem duplicar cadastro.
