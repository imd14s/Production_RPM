-- Equivalência de embalagem nos insumos.
--
-- Decisão do responsável (2026-11-13): quando um insumo é comprado em caixa ou
-- pacote, o responsável informa quantas unidades cabem na embalagem. Isso
-- permite escrever a ficha técnica na unidade que o trabalho realmente usa
-- ("12 unidades") e o sistema converte para a unidade base do insumo (a
-- caixa), mantendo o custo correto.
--
-- A coluna só faz sentido para unidades de embalagem: o banco recusa a
-- combinação com as demais.

alter table public.supplies
  add column units_per_package numeric(12,6);

comment on column public.supplies.units_per_package is
  'Quantas unidades cabem em uma caixa ou pacote do insumo. Usado para converter a quantidade da ficha técnica para a unidade base.';

alter table public.supplies
  add constraint supplies_units_per_package_positive
  check (units_per_package is null or units_per_package > 0);

alter table public.supplies
  add constraint supplies_units_per_package_unit
  check (units_per_package is null or unit in ('caixa', 'pacote'));
