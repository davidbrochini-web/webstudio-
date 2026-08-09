-- ============================================================
-- 0042_leads_faq_base_conhecimento.sql
--
-- Base de conhecimento pra sugestão automática de resposta no campo
-- "Registrar pergunta que o cliente fez" (LeadFaqPanel). SEM chamada
-- de IA — busca por similaridade de texto direto no Postgres, usando
-- a extensão pg_trgm (trigram matching, tolera erro de digitação,
-- ordem de palavra diferente, sinônimo próximo).
--
-- Diferente de leads_omnidesign_faq (0041): essa tabela não é por
-- lead, é uma base única de referência (perguntas canônicas por
-- segmento), usada só como corpus de busca.
-- ============================================================

create extension if not exists pg_trgm;

create table leads_faq_base_conhecimento (
  id uuid primary key default gen_random_uuid(),
  segmento text,
  pergunta text not null,
  resposta text not null,
  created_at timestamptz not null default now()
);

comment on table leads_faq_base_conhecimento is
  'Base de conhecimento única (não por lead) usada como corpus de busca por similaridade pra sugerir resposta no CRM. segmento=null significa resposta genérica, aplicável a qualquer segmento.';
comment on column leads_faq_base_conhecimento.segmento is
  'Segmento do lead (ex: Dentista, Curso Livre). NULL = resposta genérica, entra na busca de qualquer segmento.';

alter table leads_faq_base_conhecimento enable row level security;

create policy leads_faq_base_select on leads_faq_base_conhecimento
  for select using (is_super_admin());

create policy leads_faq_base_insert on leads_faq_base_conhecimento
  for insert to authenticated
  with check (is_super_admin());

create policy leads_faq_base_update on leads_faq_base_conhecimento
  for update using (is_super_admin());

create policy leads_faq_base_delete on leads_faq_base_conhecimento
  for delete using (is_super_admin());

create index idx_leads_faq_base_pergunta_trgm
  on leads_faq_base_conhecimento using gin (pergunta gin_trgm_ops);

create index idx_leads_faq_base_segmento on leads_faq_base_conhecimento(segmento);

-- Função de busca: recebe o segmento do lead + o texto da pergunta que
-- o cliente fez, devolve a resposta mais parecida (considerando o
-- segmento do lead + respostas genéricas), só se a similaridade passar
-- de um limiar mínimo (0.3 — testado manualmente: abaixo disso passou
-- a dar falso positivo em pergunta sem relação nenhuma). SQL puro, sem
-- SECURITY DEFINER (roda como o usuário chamador, sujeito à RLS acima,
-- que já exige super-admin).
create or replace function buscar_sugestao_faq(p_segmento text, p_pergunta text)
returns table(resposta text, pergunta_base text, similaridade real)
language sql
stable
as $$
  select b.resposta, b.pergunta, similarity(b.pergunta, p_pergunta) as similaridade
  from leads_faq_base_conhecimento b
  where (b.segmento = p_segmento or b.segmento is null)
    and similarity(b.pergunta, p_pergunta) > 0.3
  order by similaridade desc
  limit 1;
$$;

grant execute on function buscar_sugestao_faq(text, text) to authenticated;
