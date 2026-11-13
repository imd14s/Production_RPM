-- Conversões de unidades por insumo.
--
-- Um insumo tem uma unidade base (supplies.unit). Quando a compra ou o uso
-- acontece em outra unidade, o fator de conversão (quantas unidades de
-- destino existem em uma unidade de origem) é cadastrado aqui. A aplicação
-- usa esses fatores na precificação (Etapa 6); esta etapa apenas os guarda.
-- Exclusão lógica via is_active; RLS e auditoria padrão.

create table public.supply_unit_conversions (
  id uuid primary key default gen_random_uuid(),
  supply_id uuid not null references public.supplies (id) on delete cascade,
  from_unit public.supply_unit not null,
  to_unit public.supply_unit not null,
  factor numeric(12, 6) not null check (factor > 0),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supply_unit_conversions_distinct_units check (from_unit <> to_unit)
);

comment on table public.supply_unit_conversions is
  'Fatores de conversão entre unidades de medida de um insumo. Exclusão lógica via is_active.';

create unique index supply_unit_conversions_unique_pair
  on public.supply_unit_conversions (supply_id, from_unit, to_unit);

create index supply_unit_conversions_supply_idx
  on public.supply_unit_conversions (supply_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger supply_unit_conversions_set_updated_at
  before update on public.supply_unit_conversions
  for each row
  execute function public.set_updated_at();

create trigger supply_unit_conversions_audit
  after insert or update or delete on public.supply_unit_conversions
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.supply_unit_conversions enable row level security;

create policy "supply_unit_conversions_select_authenticated"
  on public.supply_unit_conversions
  for select
  to authenticated
  using (true);

create policy "supply_unit_conversions_insert_admin"
  on public.supply_unit_conversions
  for insert
  to authenticated
  with check (public.is_admin());

create policy "supply_unit_conversions_update_admin"
  on public.supply_unit_conversions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.supply_unit_conversions to authenticated;