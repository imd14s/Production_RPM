-- Estende o produto com custos auxiliares de impressão 3D e acabamento.
--
-- A função transacional de gravação passa a receber e persistir esses campos.

drop function if exists public.save_product_with_components(
  uuid,
  text,
  public.product_kind,
  smallint,
  text,
  jsonb
);

create or replace function public.save_product_with_components(
  p_product_id uuid,
  p_name text,
  p_kind public.product_kind,
  p_labor_minutes smallint,
  p_energy_cost_cents bigint,
  p_machine_cost_cents bigint,
  p_finishing_cost_cents bigint,
  p_failure_rate_percent numeric,
  p_notes text,
  p_components jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  saved_product_id uuid;
  component_value jsonb;
  supply_component_id uuid;
  product_component_id uuid;
  component_quantity numeric;
begin
  if not public.is_admin() then
    raise exception using
      errcode = '42501',
      message = 'Apenas administradores podem alterar produtos.';
  end if;

  if jsonb_typeof(p_components) is distinct from 'array' then
    raise exception using
      errcode = '22023',
      message = 'A composição enviada deve ser uma lista.';
  end if;

  if p_product_id is null then
    insert into public.products (
      name,
      kind,
      labor_minutes,
      energy_cost_cents,
      machine_cost_cents,
      finishing_cost_cents,
      failure_rate_percent,
      notes
    )
    values (
      p_name,
      p_kind,
      p_labor_minutes,
      p_energy_cost_cents,
      p_machine_cost_cents,
      p_finishing_cost_cents,
      p_failure_rate_percent,
      nullif(btrim(p_notes), '')
    )
    returning id into saved_product_id;
  else
    update public.products
      set name = p_name,
          kind = p_kind,
          labor_minutes = p_labor_minutes,
          energy_cost_cents = p_energy_cost_cents,
          machine_cost_cents = p_machine_cost_cents,
          finishing_cost_cents = p_finishing_cost_cents,
          failure_rate_percent = p_failure_rate_percent,
          notes = nullif(btrim(p_notes), '')
      where id = p_product_id
      returning id into saved_product_id;

    if saved_product_id is null then
      raise exception using
        errcode = 'P0002',
        message = 'O produto informado não existe.';
    end if;

    delete from public.product_components
      where product_id = saved_product_id;
  end if;

  for component_value in
    select value
      from jsonb_array_elements(p_components) as component(value)
  loop
    if jsonb_typeof(component_value) is distinct from 'object' then
      raise exception using
        errcode = '22023',
        message = 'Um item da composição está inválido.';
    end if;

    supply_component_id :=
      nullif(component_value ->> 'supplyId', '')::uuid;
    product_component_id :=
      nullif(component_value ->> 'productId', '')::uuid;
    component_quantity :=
      nullif(component_value ->> 'quantity', '')::numeric;

    if (supply_component_id is null) = (product_component_id is null) then
      raise exception using
        errcode = '23514',
        message = 'Cada componente deve apontar para um único insumo ou produto.';
    end if;

    if component_quantity is null
      or component_quantity <= 0
      or component_quantity > 1000000
      or component_quantity * 1000 <> trunc(component_quantity * 1000)
    then
      raise exception using
        errcode = '23514',
        message = 'A quantidade do componente deve ser positiva e ter até três casas decimais.';
    end if;

    insert into public.product_components (
      product_id,
      supply_id,
      component_product_id,
      quantity
    )
    values (
      saved_product_id,
      supply_component_id,
      product_component_id,
      component_quantity
    );
  end loop;

  return saved_product_id;
end;
$$;

revoke all on function public.save_product_with_components(
  uuid,
  text,
  public.product_kind,
  smallint,
  bigint,
  bigint,
  bigint,
  numeric,
  text,
  jsonb
) from public;

grant execute on function public.save_product_with_components(
  uuid,
  text,
  public.product_kind,
  smallint,
  bigint,
  bigint,
  bigint,
  numeric,
  text,
  jsonb
) to authenticated;