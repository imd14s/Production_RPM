create or replace function public.create_supply_with_initial_price(
  p_name text,
  p_kind public.supply_kind,
  p_unit public.supply_unit,
  p_supply_notes text,
  p_acquired_on date,
  p_quantity numeric,
  p_purchase_unit public.supply_unit,
  p_amount_cents bigint,
  p_freight_cents bigint,
  p_unit_cost_cents bigint
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  created_supply_id uuid;
begin
  if not public.is_admin() then
    raise exception using
      errcode = '42501',
      message = 'Apenas administradores podem cadastrar insumos e compras.';
  end if;

  insert into public.supplies (name, kind, unit, notes)
  values (p_name, p_kind, p_unit, nullif(btrim(p_supply_notes), ''))
  returning id into created_supply_id;

  insert into public.supply_prices (
    supply_id,
    acquired_on,
    quantity,
    purchase_unit,
    amount_cents,
    freight_cents,
    unit_cost_cents
  )
  values (
    created_supply_id,
    p_acquired_on,
    p_quantity,
    p_purchase_unit,
    p_amount_cents,
    p_freight_cents,
    p_unit_cost_cents
  );

  return created_supply_id;
end;
$$;

revoke all on function public.create_supply_with_initial_price(
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
) from public, anon;

grant execute on function public.create_supply_with_initial_price(
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
) to authenticated;

comment on function public.create_supply_with_initial_price(
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
) is
  'Cria um insumo e sua primeira compra em uma transação, respeitando RLS e exigindo perfil administrador.';
