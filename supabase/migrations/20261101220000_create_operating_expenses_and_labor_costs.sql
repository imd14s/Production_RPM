-- Despesas fixas mensais e custos de mão de obra.
--
-- Estas são as despesas que não dependem de um produto: aluguel, luz, internet,
-- sistemas — e as pessoas do ateliê com salário mensal e horas de trabalho.
-- A Etapa 6 (precificação) rateia esses valores na composição do custo.
-- Dinheiro em centavos inteiros, horas em casas decimais.

-- ---------------------------------------------------------------------------
-- Despesas fixas
-- ---------------------------------------------------------------------------

create table public.operating_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  amount_cents bigint not null check (amount_cents > 0),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.operating_expenses is
  'Despesas fixas mensais do ateliê. Exclusão lógica via is_active.';

create unique index operating_expenses_name_key
  on public.operating_expenses (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Mão de obra
-- ---------------------------------------------------------------------------

create table public.labor_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  monthly_wage_cents bigint not null check (monthly_wage_cents > 0),
  standard_hours_month numeric(5, 2) not null
    check (standard_hours_month > 0 and standard_hours_month <= 438),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.labor_costs is
  'Pessoas ou funções com salário mensal e horas mensais de referência da hora de trabalho.';

create unique index labor_costs_name_key
  on public.labor_costs (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger operating_expenses_set_updated_at
  before update on public.operating_expenses
  for each row
  execute function public.set_updated_at();

create trigger operating_expenses_audit
  after insert or update or delete on public.operating_expenses
  for each row
  execute function public.log_configuration_change();

create trigger labor_costs_set_updated_at
  before update on public.labor_costs
  for each row
  execute function public.set_updated_at();

create trigger labor_costs_audit
  after insert or update or delete on public.labor_costs
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.operating_expenses enable row level security;
alter table public.labor_costs enable row level security;

create policy "operating_expenses_select_authenticated"
  on public.operating_expenses
  for select
  to authenticated
  using (true);

create policy "operating_expenses_insert_admin"
  on public.operating_expenses
  for insert
  to authenticated
  with check (public.is_admin());

create policy "operating_expenses_update_admin"
  on public.operating_expenses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "labor_costs_select_authenticated"
  on public.labor_costs
  for select
  to authenticated
  using (true);

create policy "labor_costs_insert_admin"
  on public.labor_costs
  for insert
  to authenticated
  with check (public.is_admin());

create policy "labor_costs_update_admin"
  on public.labor_costs
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.operating_expenses to authenticated;
grant select, insert, update on public.labor_costs to authenticated;
