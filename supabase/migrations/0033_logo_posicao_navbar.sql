-- Cliente pediu pra poder escolher entre logo no canto esquerdo (padrão
-- anterior) ou centralizado no meio do menu (preferência dele agora).
-- Default 'centro' porque é o que o cliente já decidiu que quer nesta
-- sessão — não é neutro tecnicamente, é a escolha dele documentada.
alter table sites add column logo_posicao text not null default 'centro';
alter table sites add constraint sites_logo_posicao_valida
  check (logo_posicao in ('esquerda', 'centro'));

comment on column sites.logo_posicao is
  'Posição do logo/medalhão na navbar do projeto especial: esquerda (canto) ou centro (meio do menu, dividindo os itens nos dois lados).';
