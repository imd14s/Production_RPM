-- Custos auxiliares de impressão 3D e acabamento por produto.
--
-- Todos opcionais: entram no custo de fabricação apenas quando informados.

alter table public.products
  add column energy_cost_cents bigint
    check (energy_cost_cents is null or energy_cost_cents >= 0),
  add column machine_cost_cents bigint
    check (machine_cost_cents is null or machine_cost_cents >= 0),
  add column finishing_cost_cents bigint
    check (finishing_cost_cents is null or finishing_cost_cents >= 0),
  add column failure_rate_percent numeric(9, 6)
    check (failure_rate_percent is null or (failure_rate_percent >= 0 and failure_rate_percent <= 100));