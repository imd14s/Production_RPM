-- Simulações de precificação por canal e modalidade.
--
-- Cada simulação congela o custo (via cost_snapshots) e os parâmetros usados,
-- registrando o preço resultante. Imutável: apenas inserção.

create table public.pricing_simulations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  cost_snapshot_id uuid not null references public.cost_snapshots (id) on delete restrict,
  channel_id uuid not null references public.sales_channels (id) on delete restrict,
  payment_method_id uuid references public.payment_methods (id),
  modality text not null check (modality in ('varejo', 'atacado')),
  margin_percent numeric(9, 6) not null check (margin_percent >= 0 and margin_percent <= 1),
  variable_percent numeric(9, 6) not null check (variable_percent >= 0 and variable_percent <= 1),
  fixed_fees_cents bigint not null check (fixed_fees_cents >= 0),
  price_cents bigint not null check (price_cents >= 0),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

comment on table public.pricing_simulations is
  'Simulação de preço por produto, canal e modalidade, com custo congelado.';

create index pricing_simulations_product_idx on public.pricing_simulations (product_id);
create index pricing_simulations_channel_idx on public.pricing_simulations (channel_id);

alter table public.pricing_simulations enable row level security;

create policy "pricing_simulations_select_authenticated"
  on public.pricing_simulations
  for select
  to authenticated
  using (true);

create policy "pricing_simulations_insert_admin"
  on public.pricing_simulations
  for insert
  to authenticated
  with check (public.is_admin());

grant select, insert on public.pricing_simulations to authenticated;