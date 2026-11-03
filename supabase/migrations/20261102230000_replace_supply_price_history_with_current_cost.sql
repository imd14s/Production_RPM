-- Mantém no insumo apenas o custo atual. A aquisição mais recente é migrada
-- somente quando sua quantidade pode ser expressa na unidade base conhecida.

alter table public.supplies
  add column quantity numeric(12, 3),
  add column acquired_on date,
  add column amount_cents bigint,
  add column freight_cents bigint,
  add column unit_cost_cents bigint,
  add constraint supplies_quantity_positive
    check (quantity is null or quantity > 0),
  add constraint supplies_amount_cents_positive
    check (amount_cents is null or amount_cents > 0),
  add constraint supplies_freight_cents_nonnegative
    check (freight_cents is null or freight_cents >= 0),
  add constraint supplies_unit_cost_cents_nonnegative
    check (unit_cost_cents is null or unit_cost_cents >= 0),
  add constraint supplies_current_cost_complete
    check (
      (
        quantity is null
        and acquired_on is null
        and amount_cents is null
        and freight_cents is null
        and unit_cost_cents is null
      )
      or (
        quantity is not null
        and acquired_on is not null
        and amount_cents is not null
        and freight_cents is not null
        and unit_cost_cents is not null
      )
    );

with latest_prices as (
  select distinct on (price.supply_id)
    price.supply_id,
    price.acquired_on,
    price.quantity,
    price.purchase_unit,
    price.amount_cents,
    price.freight_cents
  from public.supply_prices as price
  order by
    price.supply_id,
    price.acquired_on desc,
    price.updated_at desc,
    price.created_at desc,
    price.id desc
),
converted_prices as (
  select
    latest.supply_id,
    latest.acquired_on,
    latest.amount_cents,
    latest.freight_cents,
    case
      when latest.purchase_unit = supply.unit then latest.quantity
      when latest.purchase_unit = 'quilograma'::public.supply_unit
        and supply.unit = 'grama'::public.supply_unit then latest.quantity * 1000
      when latest.purchase_unit = 'grama'::public.supply_unit
        and supply.unit = 'quilograma'::public.supply_unit then latest.quantity / 1000
      when latest.purchase_unit = 'litro'::public.supply_unit
        and supply.unit = 'mililitro'::public.supply_unit then latest.quantity * 1000
      when latest.purchase_unit = 'mililitro'::public.supply_unit
        and supply.unit = 'litro'::public.supply_unit then latest.quantity / 1000
      else null
    end as base_quantity
  from latest_prices as latest
  join public.supplies as supply on supply.id = latest.supply_id
),
valid_prices as (
  select
    converted.supply_id,
    converted.acquired_on,
    converted.amount_cents,
    converted.freight_cents,
    round(converted.base_quantity, 3) as base_quantity
  from converted_prices as converted
  where converted.base_quantity is not null
    and round(converted.base_quantity, 3) > 0
    and round(converted.base_quantity, 3) <= 999999999.999
    and round(
      (converted.amount_cents::numeric + converted.freight_cents::numeric)
        / nullif(round(converted.base_quantity, 3), 0)
    ) <= 9223372036854775807
)
update public.supplies as supply
set
  quantity = valid.base_quantity,
  acquired_on = valid.acquired_on,
  amount_cents = valid.amount_cents,
  freight_cents = valid.freight_cents,
  unit_cost_cents = round(
    (valid.amount_cents::numeric + valid.freight_cents::numeric) / valid.base_quantity
  )::bigint
from valid_prices as valid
where supply.id = valid.supply_id;

drop function public.create_supply_with_initial_price(
  text,
  public.supply_kind,
  public.supply_unit,
  text,
  date,
  numeric,
  public.supply_unit,
  bigint,
  bigint,
  bigint
);

drop table public.supply_prices;

comment on column public.supplies.quantity is
  'Quantidade da compra atual, registrada na unidade base do insumo.';
comment on column public.supplies.acquired_on is
  'Data da compra que define o custo atual do insumo.';
comment on column public.supplies.amount_cents is
  'Valor total pago pela compra atual, sem frete, em centavos.';
comment on column public.supplies.freight_cents is
  'Frete da compra atual em centavos.';
comment on column public.supplies.unit_cost_cents is
  'Custo atual por unidade base, incluindo frete rateado, em centavos.';
