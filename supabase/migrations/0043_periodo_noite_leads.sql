-- 0043: Adiciona 'noite' ao CHECK constraint de site_leads.periodo.
--
-- Cliente reportou que a agenda "não tem opção noturno". A agenda de
-- verdade (agendamento_horarios) já tinha sido estendida numa sessão
-- anterior (Seg-Qui até 21h, Sex até 20h) — mas o formulário informal
-- de /contato (ContatoForm.tsx, pedido de "prefiro esse período",
-- diferente do agendamento em tempo real) tinha um seletor Manhã/Tarde
-- sem Noite, E o banco tinha um CHECK constraint reforçando só esses
-- dois valores — mesmo corrigindo a tela, o insert seria rejeitado no
-- banco. Os dois lados precisavam mudar junto.

alter table site_leads drop constraint site_leads_periodo_check;
alter table site_leads add constraint site_leads_periodo_check
  check (periodo is null or periodo = any (array['manha', 'tarde', 'noite']));
