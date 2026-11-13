-- Insumos e o histórico de aquisições.
--
-- Cada compra é registrada: quantidade, valor pago, frete e fornecedor. O
-- custo por unidade é gravado como snapshot no momento da gravação — mudar o
-- preço depois não retroage em custos de peças já precificadas ou vendidas.
-- Quantidade com até 3 casas (gramas, metros parciais); dinheiro em centavos.

create type public.supply_kind as enum (
  'materia_prima',
  'revenda',
  'impressao_3d',
  'embalagem',
  'outro'
);

create type public.supply_unit as enum (
  'unidade',
  'metro',
  'grama',
  'quilograma',
  'mililitro',
  'litro',
  'pacote',
  'caixa',
  'outro'
);

-- ---------------------------------------------------------------------------
-- Insumos
-- ---------------------------------------------------------------------------

create table public.supplies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  kind public.supply_kind not null default 'materia_prima',
  unit public.supply_unit not null default 'unidade',
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.supplies is
  'Insumos do ateliê: matéria-prima, revenda, impressão 3D e embalagem. Exclusão lógica via is_active.';

create unique index supplies_name_key
  on public.supplies (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Aquisições (histórico de preços)
-- ---------------------------------------------------------------------------

create table public.supply_prices (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid not null references public.supplies (id) on delete cascade,
  supplier_id uuid references public.suppliers (id),
  acquired_on date not null default current_date,
  quantity numeric(12, 3) not null check (quantity > 0),
  amount_cents bigint not null check (amount_cents > 0),
  freight_cents bigint not null default 0 check (freight_cents >= 0),
  unit_cost_cents bigint not null check (unit_cost_cents > 0),
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.supply_prices is
  'Aquisição de insumo: quantidade, valor pago, frete e fornecedor; o custo por unidade é gravado como snapshot no momento da gravação.';

create index supply_prices_supply_idx on public.supply_prices (supply_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger supplies_set_updated_at
  before update on public.supplies
  for each row
  execute function public.set_updated_at();

create trigger supplies_audit
  after insert or update or delete on public.supplies
  for each row
  execute function public.log_configuration_change();

create trigger supply_prices_set_updated_at
  before update on public.supply_prices
  for each row
  execute function public.set_updated_at();

create trigger supply_prices_audit
  after insert or update or delete on public.supply_prices
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.supplies enable row level security;
alter table public.supply_prices enable row level security;

create policy "supplies_select_authenticated"
  on public.supplies
  for select
  to authenticated
  using (true);

create policy "supplies_insert_admin"
  on public.supplies
  for insert
  to authenticated
  with check (public.is_admin());

create policy "supplies_update_admin"
  on public.supplies
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "supply_prices_select_authenticated"
  on public.supply_prices
  for select
  to authenticated
  using (true);

create policy "supply_prices_insert_admin"
  on public.supply_prices
  for insert
  to authenticated
  with check (public.is_admin());

create policy "supply_prices_update_admin"
  on public.supply_prices
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.supplies to authenticated;
grant select, insert, update on public.supply_prices to authenticated;
