-- Integridade e gravação atômica para produtos e fichas técnicas.
-- Migration separada para não reescrever a migration inicial de produtos.

create index product_components_component_product_idx
  on public.product_components (component_product_id)
  where component_product_id is not null;

-- A trava serializa alterações na árvore antes da consulta recursiva. Assim,
-- duas gravações concorrentes não conseguem criar um ciclo entre si.
create or replace function public.prevent_product_component_cycles()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  parent_kind public.product_kind;
  cycle_found boolean;
begin
  select kind
    into parent_kind
    from public.products
    where id = new.product_id;

  if parent_kind = 'kit' and new.component_product_id is null then
    raise exception using
      errcode = '23514',
      message = 'Kits só podem conter produtos como componentes.';
  end if;

  if new.component_product_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(934520);

  with recursive descendants(product_id) as (
    select new.component_product_id
    union
    select component.component_product_id
      from public.product_components as component
      join descendants on component.product_id = descendants.product_id
      where component.component_product_id is not null
  )
  select exists (
    select 1
      from descendants
      where product_id = new.product_id
  )
  into cycle_found;

  if cycle_found then
    raise exception using
      errcode = '23514',
      message = 'A composição criaria uma referência circular entre produtos.';
  end if;

  return new;
end;
$$;

create trigger product_components_prevent_cycles
  before insert or update on public.product_components
  for each row
  execute function public.prevent_product_component_cycles();

-- A verificação diferida permite que a RPC substitua a ficha de um kit numa
-- única transação, sem deixar o kit vazio entre o DELETE e os novos INSERTs.
create or replace function public.ensure_kit_has_product_component()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  target_product_ids uuid[];
  target_product_id uuid;
  target_kind public.product_kind;
  has_product_component boolean;
begin
  if tg_table_name = 'products' then
    target_product_ids := array[new.id];
  elsif tg_op = 'DELETE' then
    target_product_ids := array[old.product_id];
  elsif tg_op = 'UPDATE' and old.product_id <> new.product_id then
    target_product_ids := array[old.product_id, new.product_id];
  else
    target_product_ids := array[new.product_id];
  end if;

  foreach target_product_id in array target_product_ids
  loop
    select kind
      into target_kind
      from public.products
      where id = target_product_id;

    if target_kind is distinct from 'kit' then
      continue;
    end if;

    select exists (
      select 1
        from public.product_components
        where product_id = target_product_id
          and component_product_id is not null
    )
    into has_product_component;

    if not has_product_component then
      raise exception using
        errcode = '23514',
        message = 'Um kit precisa ter ao menos um componente do tipo produto.';
    end if;
  end loop;

  return null;
end;
$$;

create constraint trigger products_require_kit_component
  after insert or update on public.products
  deferrable initially deferred
  for each row
  execute function public.ensure_kit_has_product_component();

create constraint trigger product_components_require_kit_component
  after insert or update or delete on public.product_components
  deferrable initially deferred
  for each row
  execute function public.ensure_kit_has_product_component();

-- Uma chamada grava produto e ficha técnica como uma única transação.
create or replace function public.save_product_with_components(
  p_product_id uuid,
  p_name text,
  p_kind public.product_kind,
  p_labor_minutes smallint,
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
    insert into public.products (name, kind, labor_minutes, notes)
    values (p_name, p_kind, p_labor_minutes, nullif(btrim(p_notes), ''))
    returning id into saved_product_id;
  else
    update public.products
      set name = p_name,
          kind = p_kind,
          labor_minutes = p_labor_minutes,
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
  text,
  jsonb
) from public;

grant execute on function public.save_product_with_components(
  uuid,
  text,
  public.product_kind,
  smallint,
  text,
  jsonb
) to authenticated;

comment on function public.save_product_with_components(
  uuid,
  text,
  public.product_kind,
  smallint,
  text,
  jsonb
) is 'Grava produto e composição atomicamente, respeitando RLS e o perfil administrador.';
