-- ============================================================
-- 0036_leads_status_e_campos_comerciais.sql
--
-- Duas coisas pedidas pelo David junto com a importação de 49 leads
-- (planilha "Leads Omnidesign - Tatuapé/Vila Mariana/Santa Cruz"):
--
-- 1) Novos status pro funil: "em_negociacao" e "perdido" — ficam ao
--    lado dos que já existiam, não substituem nada.
-- 2) Campos vindos da planilha que são úteis pro time comercial agir
--    (não trouxe a planilha inteira, só o que tem uso prático):
--    bairro, endereço, avaliação do Google (nota + contagem) e um
--    responsável (quem da equipe está tocando aquele lead agora —
--    diferente de created_by, que é quem cadastrou o registro).
-- ============================================================

alter table leads_omnidesign drop constraint leads_omnidesign_status_valido;
alter table leads_omnidesign add constraint leads_omnidesign_status_valido
  check (status in ('novo', 'contatado', 'em_negociacao', 'sem_interesse', 'convertido', 'perdido'));

alter table leads_omnidesign add column bairro text;
alter table leads_omnidesign add column endereco text;
alter table leads_omnidesign add column nota_google numeric(2,1);
alter table leads_omnidesign add column avaliacoes_google integer;
alter table leads_omnidesign add column responsavel_id uuid references profiles(id);

comment on column leads_omnidesign.bairro is 'Bairro/região do lead — usado pelo time comercial pra organizar abordagem por área.';
comment on column leads_omnidesign.endereco is 'Endereço do negócio, contexto rápido pra quem for contatar.';
comment on column leads_omnidesign.nota_google is 'Nota do Google Maps no momento do levantamento (sinal de porte/qualidade do lead).';
comment on column leads_omnidesign.avaliacoes_google is 'Número de avaliações no Google Maps no momento do levantamento.';
comment on column leads_omnidesign.responsavel_id is 'Pessoa da equipe responsável por tocar esse lead agora — diferente de created_by (quem cadastrou o registro).';

create index idx_leads_omnidesign_responsavel on leads_omnidesign(responsavel_id) where deleted_at is null;
