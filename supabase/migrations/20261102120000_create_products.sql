-- Produtos e fichas técnicas (composições).
--
-- Um produto é fabricado (composição de insumos), revendido (linha de compra),
-- impresso em 3D (filamento + tempo) ou kit (composição de produtos). A composição
-- pode apontar para outro produto, mas nao há cadeias circulares: o banco proíbe
-- a autorreferência e a aplicação detecta ciclos antes de gravar.
-- Minutos de mão de obra por peça ficam no cadastro — a Etapa 6 converte em custo
-- usando a mão de obra configurada.

create type public.product_kind as enum (
  'fabricado',
  'revenda',
  'impressao_3d',
  'kit'
);

-- ---------------------------------------------------------------------------
-- Produtos
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  kind public.product_kind not null default 'fabricado',
  labor_minutes smallint check (labor_minutes is null or labor_minutes between 0 and 2880),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  'Produtos do ateliê nas quatro modalidades. Exclusão lógica via is_active. labor_minutes = minutos de mão de obra por peça.';

create unique index products_name_key on public.products (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Componentes da ficha técnica
-- ---------------------------------------------------------------------------

create table public.product_components (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  supply_id uuid references public.supplies (id),
  component_product_id uuid references public.products (id),
  quantity numeric(12, 3) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_components_single_target check (
    (supply_id is not null and component_product_id is null)
    or (supply_id is null and component_product_id is not null)
  ),
  constraint product_components_no_self_reference check (
    component_product_id is null or component_product_id <> product_id
  )
);

comment on table public.product_components is
  'Linha da ficha técnica: um insumo com quantidade ou outro produto (kit/subproduto), nunca os dois.';

create index product_components_product_idx on public.product_components (product_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create trigger products_audit
  after insert or update or delete on public.products
  for each row
  execute function public.log_configuration_change();

create trigger product_components_set_updated_at
  before update on public.product_components
  for each row
  execute function public.set_updated_at();

create trigger product_components_audit
  after insert or update or delete on public.product_components
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.product_components enable row level security;

create policy "products_select_authenticated"
  on public.products
  for select
  to authenticated
  using (true);

create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_components_select_authenticated"
  on public.product_components
  for select
  to authenticated
  using (true);

create policy "product_components_insert_admin"
  on public.product_components
  for insert
  to authenticated
  with check (public.is_admin());

create policy "product_components_update_admin"
  on public.product_components
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_components_delete_admin"
  on public.product_components
  for delete
  to authenticated
  using (public.is_admin());

grant select, insert, update on public.products to authenticated;
grant select, insert, update, delete on public.product_components to authenticated;
