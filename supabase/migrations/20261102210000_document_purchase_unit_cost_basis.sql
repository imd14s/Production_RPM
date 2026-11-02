comment on column public.supply_prices.purchase_unit is
  'Unidade informada na compra. quantity e unit_cost_cents correspondem a esta unidade; a aplicação só converte para supplies.unit quando há conversão métrica conhecida.';

comment on column public.supply_prices.unit_cost_cents is
  'Custo unitário em centavos na unidade indicada por purchase_unit; não é normalizado no banco para supplies.unit.';
