-- O custo unitário do snapshot usa a unidade indicada em purchase_unit.
-- A aplicação só normaliza para a unidade base quando uma conversão métrica
-- conhecida permite comparar as unidades.
comment on column public.supply_prices.unit_cost_cents is
  'Custo unitário em centavos na unidade de purchase_unit; a aplicação só o usa na unidade base quando as unidades são compatíveis.';
