-- ============================================================
-- 0065_instagram_feed.sql
--
-- Feed do Instagram nos sites (Omnidesign + tenants/Projetos
-- Especiais) via Behold (behold.so) — o Behold cuida de todo o
-- OAuth/token da Meta e expõe um JSON feed por conta conectada.
--
-- Arquitetura decidida em 16/08 (com o David):
--   Behold JSON --> cron 5x/dia --> tabela (cache) --> página lê do banco
--
-- O site NUNCA chama o Behold direto: visitas geram zero views lá
-- (o free plan tem 1.200 views/mês; 5 fetches/dia = ~150/mês por
-- feed → free segura ~8 feeds, Starter $10 segura ~130).
-- ============================================================

create table if not exists instagram_feeds (
  id                uuid primary key default gen_random_uuid(),
  -- chave estável pra lookup no código ('omnidesign', slug do projeto
  -- especial, etc.) — não depende de tenant_id porque o site da
  -- própria Omnidesign não é um tenant comum.
  chave             text not null unique,
  -- tenant dono do feed (null pro feed da própria Omnidesign)
  tenant_id         uuid references tenants(id) on delete cascade,
  -- URL do JSON feed no Behold (ex.: https://feeds.behold.so/XXXX).
  -- null = feed cadastrado mas ainda não conectado (seção não renderiza).
  behold_feed_url   text,
  ativo             boolean not null default true,
  -- cache dos posts, já normalizados pro formato que o frontend consome
  posts             jsonb not null default '[]'::jsonb,
  fetched_at        timestamptz,
  last_fetch_ok     boolean,
  last_fetch_error  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table instagram_feeds is
  'Config + cache do feed Instagram por site (fonte: Behold JSON). Atualizado pelo cron instagram-feed-refresh 5x/dia; páginas leem daqui, nunca do Behold direto.';
comment on column instagram_feeds.chave is
  'Identificador estável usado pelo código pra buscar o feed do site certo (ex.: omnidesign, dentista-joao).';
comment on column instagram_feeds.behold_feed_url is
  'URL do JSON feed no Behold. Enquanto null, a seção de Instagram do site não renderiza.';

-- RLS: nenhuma policy = só service_role lê/escreve. A URL do feed do
-- Behold não é exatamente segredo, mas não há motivo pra expor; os
-- posts chegam ao browser já renderizados pelo server component.
alter table instagram_feeds enable row level security;

-- Feed da própria Omnidesign já nasce cadastrado (sem URL — o David
-- cola a URL do Behold quando criar a conta; até lá a seção não aparece).
insert into instagram_feeds (chave, tenant_id, behold_feed_url)
values ('omnidesign', null, null)
on conflict (chave) do nothing;

-- Cron: 5x/dia nos horários 9h, 12h, 15h, 18h, 21h de Brasília
-- (UTC-3 → 12,15,18,21,0 UTC). Mesmo padrão pg_net + Vault dos
-- demais crons (ver demo-purge-soft-deletadas).
select cron.schedule(
  'instagram-feed-refresh',
  '0 0,12,15,18,21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://webstudio-red-eight.vercel.app/api/cron/instagram-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_lembretes_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
