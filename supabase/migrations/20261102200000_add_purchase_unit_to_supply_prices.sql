-- Registra a unidade usada em cada aquisição, preservando a unidade original
-- da compra e permitindo calcular o custo pela unidade base do insumo.

alter table public.supply_prices
  add column purchase_unit public.supply_unit;

update public.supply_prices as price
set purchase_unit = supply.unit
from public.supplies as supply
where supply.id = price.supply_id
  and price.purchase_unit is null;

alter table public.supply_prices
  alter column purchase_unit set not null;

comment on column public.supply_prices.purchase_unit is
  'Unidade de medida informada na compra; quantity permanece na unidade de compra e unit_cost_cents é normalizado para supplies.unit.';
