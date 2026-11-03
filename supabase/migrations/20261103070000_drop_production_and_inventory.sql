-- Remoção dos módulos de produção e estoque.
--
-- O sistema passa a ser focado em precificação (planilha de cálculo de preço),
-- sem controle de unidade produzida. As tabelas abaixo deixam de ser usadas.
-- A remoção do código da aplicação já foi feita; esta migration remove o
-- armazenamento correspondente.
--
-- Aplique somente após confirmar que não há dados necessários ou após backup.

drop table if exists public.production_consumption cascade;
drop table if exists public.production_batches cascade;
drop table if exists public.inventory_movements cascade;