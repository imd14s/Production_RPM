-- Meios de pagamento e suas taxas.
--
-- Pix, débito, crédito, carteira digital e afins. Cada meio pode ter várias
-- taxas de processamento (maquininha, gateway): percentual ou valor fixo, com a
-- condição de pagamento opcional (parcelas).
-- O dinheiro continua em centavos inteiros e o percentual em numeric(9,6).
-- A comissão do canal de venda fica em channel_fees (família separada).

create type public.payment_method_kind as enum (
  'pix',
  'debito',
  'credito',
  'carteira_digital',
  'outro'
);

-- ---------------------------------------------------------------------------
-- Meios de pagamento
-- ---------------------------------------------------------------------------

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  kind public.payment_method_kind not null default 'outro',
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.payment_methods is
  'Meios de pagamento aceitos pelo ateliê. Exclusão lógica via is_active.';

create unique index payment_methods_name_key on public.payment_methods (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Taxas por meio de pagamento
-- ---------------------------------------------------------------------------

create table public.payment_fees (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references public.payment_methods (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 2 and 80),
  kind public.tax_kind not null,
  rate numeric(9, 6),
  amount_cents bigint,
  installments smallint check (installments is null or installments between 1 and 24),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_fees_value_matches_kind check (
    (kind = 'percentual' and rate is not null and amount_cents is null)
    or (kind = 'fixo' and amount_cents is not null and rate is null)
  ),
  constraint payment_fees_rate_range check (
    rate is null or (rate >= 0 and rate <= 100)
  ),
  constraint payment_fees_amount_non_negative check (
    amount_cents is null or amount_cents >= 0
  )
);

comment on table public.payment_fees is
  'Taxas de processamento de um meio de pagamento. Percentual ou valor fixo, nunca os dois.';

create index payment_fees_method_idx on public.payment_fees (method_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger payment_methods_set_updated_at
  before update on public.payment_methods
  for each row
  execute function public.set_updated_at();

create trigger payment_methods_audit
  after insert or update or delete on public.payment_methods
  for each row
  execute function public.log_configuration_change();

create trigger payment_fees_set_updated_at
  before update on public.payment_fees
  for each row
  execute function public.set_updated_at();

create trigger payment_fees_audit
  after insert or update or delete on public.payment_fees
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.payment_methods enable row level security;
alter table public.payment_fees enable row level security;

create policy "payment_methods_select_authenticated"
  on public.payment_methods
  for select
  to authenticated
  using (true);

create policy "payment_methods_insert_admin"
  on public.payment_methods
  for insert
  to authenticated
  with check (public.is_admin());

create policy "payment_methods_update_admin"
  on public.payment_methods
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "payment_fees_select_authenticated"
  on public.payment_fees
  for select
  to authenticated
  using (true);

create policy "payment_fees_insert_admin"
  on public.payment_fees
  for insert
  to authenticated
  with check (public.is_admin());

create policy "payment_fees_update_admin"
  on public.payment_fees
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.payment_methods to authenticated;
grant select, insert, update on public.payment_fees to authenticated;
