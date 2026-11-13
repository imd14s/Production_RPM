-- Consumo real de materiais por lote de produção.

create table public.production_consumption (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.production_batches (id) on delete cascade,
  supply_id uuid not null references public.supplies (id) on delete restrict,
  quantity_used numeric(12, 3) not null check (quantity_used > 0),
  unit_cost_cents bigint not null check (unit_cost_cents >= 0),
  created_at timestamptz not null default now()
);

comment on table public.production_consumption is
  'Consumo real de insumo em um lote de produção, com custo unitário congelado.';

create index production_consumption_batch_idx on public.production_consumption (batch_id);
create index production_consumption_supply_idx on public.production_consumption (supply_id);

alter table public.production_consumption enable row level security;

create policy "production_consumption_select_authenticated"
  on public.production_consumption
  for select
  to authenticated
  using (true);

create policy "production_consumption_insert_admin"
  on public.production_consumption
  for insert
  to authenticated
  with check (public.is_admin());

grant select, insert on public.production_consumption to authenticated;