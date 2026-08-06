-- Paleta de cores editável pelo cliente (pedido: mudar as cores do site
-- pra seguir a paleta do logo dele). Defaults = cores atuais do template
-- (teal + navy), então nada muda visualmente até o cliente customizar.
alter table sites add column cor_primaria text not null default '#0EA5A0';
alter table sites add column cor_secundaria text not null default '#0B2B3C';

alter table sites add constraint sites_cor_primaria_hex
  check (cor_primaria ~ '^#[0-9a-fA-F]{6}$');
alter table sites add constraint sites_cor_secundaria_hex
  check (cor_secundaria ~ '^#[0-9a-fA-F]{6}$');

comment on column sites.cor_primaria is
  'Cor de destaque (botões, links, acentos) do site do projeto especial. Injetada como --dj-primary.';
comment on column sites.cor_secundaria is
  'Cor escura de base (nav, footer, fundos) do site do projeto especial. Injetada como --dj-secondary.';
