-- Lotes de produção.
--
-- Registra a produção de um produto, com custos de energia, máquina e
-- acabamento, além da mão de obra real. O consumo de materiais fica em
-- production_consumption.

create table public.production_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  quantity_produced numeric(12, 3) not null check (quantity_produced > 0),
  produced_at date not null default current_date,
  labor_minutes_actual integer not null default 0 check (labor_minutes_actual >= 0),
  energy_cost_cents bigint not null default 0 check (energy_cost_cents >= 0),
  machine_cost_cents bigint not null default 0 check (machine_cost_cents >= 0),
  finishing_cost_cents bigint not null default 0 check (finishing_cost_cents >= 0),
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.production_batches is
  'Lote de produção de um produto, com custos auxiliares.';

create index production_batches_product_idx on public.production_batches (product_id);

create trigger production_batches_set_updated_at
  before update on public.production_batches
  for each row
  execute function public.set_updated_at();

create trigger production_batches_audit
  after insert or update or delete on public.production_batches
  for each row
  execute function public.log_configuration_change();

alter table public.production_batches enable row level security;

create policy "production_batches_select_authenticated"
  on public.production_batches
  for select
  to authenticated
  using (true);

create policy "production_batches_insert_admin"
  on public.production_batches
  for insert
  to authenticated
  with check (public.is_admin());

create policy "production_batches_update_admin"
  on public.production_batches
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.production_batches to authenticated;