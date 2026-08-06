-- Textos customizados (chave→valor livre) — pra evitar uma coluna nova
-- toda vez que aparece mais um heading/subtítulo hardcoded no site.
-- Formato: {"home_stats_1_numero": "10+", "home_cta_titulo": "..."}
-- Chave ausente = usa o texto padrão hardcoded no componente (fallback).
alter table sites add column textos_customizados jsonb not null default '{}'::jsonb;

-- Instagram: ícone fica oculto por padrão até o cliente ativar e colar o
-- link (pedido explícito — hoje é sempre visível se instagram_handle
-- existir, sem controle separado de "quero mostrar ou não agora").
alter table sites add column instagram_visivel boolean not null default false;

comment on column sites.textos_customizados is
  'Key-value de microcopy editável (headings/subtítulos que não têm coluna própria). Chave ausente = fallback pro texto padrão do componente.';
comment on column sites.instagram_visivel is
  'Controla se o ícone/link do Instagram aparece no header/footer, independente de instagram_handle estar preenchido.';
