-- Movimentações de estoque (insumos e produtos acabados).
--
-- Histórico imutável: apenas inserção. O saldo é a soma das quantidades.

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('supply', 'product')),
  item_id uuid not null,
  movement_type text not null check (movement_type in ('entrada', 'saida', 'consumo', 'perda', 'ajuste')),
  quantity numeric(12, 3) not null,
  unit_cost_cents bigint not null default 0 check (unit_cost_cents >= 0),
  reference_type text,
  reference_id uuid,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now()
);

comment on table public.inventory_movements is
  'Movimentação imutável de estoque de insumos e produtos acabados.';

create index inventory_movements_item_idx on public.inventory_movements (item_type, item_id);
create index inventory_movements_created_idx on public.inventory_movements (created_at);

alter table public.inventory_movements enable row level security;

create policy "inventory_movements_select_authenticated"
  on public.inventory_movements
  for select
  to authenticated
  using (true);

create policy "inventory_movements_insert_admin"
  on public.inventory_movements
  for insert
  to authenticated
  with check (public.is_admin());

grant select, insert on public.inventory_movements to authenticated;