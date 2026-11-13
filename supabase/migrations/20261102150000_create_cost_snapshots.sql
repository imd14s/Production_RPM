-- Snapshots imutáveis de custo de produto.
--
-- Congela o custo completo (material, mão de obra, despesas) no momento da
-- simulação, para que alterações futuras de insumos não retroajam em preços
-- já calculados. Inserção apenas.

create table public.cost_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  cost_cents bigint not null check (cost_cents >= 0),
  material_cents bigint not null check (material_cents >= 0),
  labor_cents bigint not null check (labor_cents >= 0),
  overhead_cents bigint not null check (overhead_cents >= 0),
  components jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.cost_snapshots is
  'Snapshot imutável do custo de um produto no momento de uma simulação.';

create index cost_snapshots_product_idx on public.cost_snapshots (product_id);

alter table public.cost_snapshots enable row level security;

create policy "cost_snapshots_select_authenticated"
  on public.cost_snapshots
  for select
  to authenticated
  using (true);

create policy "cost_snapshots_insert_admin"
  on public.cost_snapshots
  for insert
  to authenticated
  with check (public.is_admin());

grant select, insert on public.cost_snapshots to authenticated;