-- Canais de venda e suas taxas.
--
-- Um canal (Mercado Livre, site próprio, loja física, WhatsApp) tem várias taxas:
-- comissão, frete, adicionais — cada uma percentual ou valor fixo, com a condição
-- de pagamento opcional (parcelas).
-- O dinheiro continua em centavos inteiros e o percentual em numeric(9,6).

create type public.channel_kind as enum (
  'marketplace',
  'site_proprio',
  'loja_fisica',
  'whatsapp',
  'outro'
);

-- ---------------------------------------------------------------------------
-- Canais
-- ---------------------------------------------------------------------------

create table public.sales_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  kind public.channel_kind not null default 'outro',
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sales_channels is
  'Canais por onde o ateliê vende. Exclusão lógica via is_active.';

create unique index sales_channels_name_key on public.sales_channels (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Taxas por canal
-- ---------------------------------------------------------------------------

create table public.channel_fees (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.sales_channels (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 2 and 80),
  kind public.tax_kind not null,
  rate numeric(9, 6),
  amount_cents bigint,
  installments smallint check (installments is null or installments between 1 and 24),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint channel_fees_value_matches_kind check (
    (kind = 'percentual' and rate is not null and amount_cents is null)
    or (kind = 'fixo' and amount_cents is not null and rate is null)
  ),
  constraint channel_fees_rate_range check (
    rate is null or (rate >= 0 and rate <= 100)
  ),
  constraint channel_fees_amount_non_negative check (
    amount_cents is null or amount_cents >= 0
  )
);

comment on table public.channel_fees is
  'Taxas de um canal de venda. Percentual ou valor fixo, nunca os dois.';

create index channel_fees_channel_idx on public.channel_fees (channel_id);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger sales_channels_set_updated_at
  before update on public.sales_channels
  for each row
  execute function public.set_updated_at();

create trigger sales_channels_audit
  after insert or update or delete on public.sales_channels
  for each row
  execute function public.log_configuration_change();

create trigger channel_fees_set_updated_at
  before update on public.channel_fees
  for each row
  execute function public.set_updated_at();

create trigger channel_fees_audit
  after insert or update or delete on public.channel_fees
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.sales_channels enable row level security;
alter table public.channel_fees enable row level security;

create policy "sales_channels_select_authenticated"
  on public.sales_channels
  for select
  to authenticated
  using (true);

create policy "sales_channels_insert_admin"
  on public.sales_channels
  for insert
  to authenticated
  with check (public.is_admin());

create policy "sales_channels_update_admin"
  on public.sales_channels
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "channel_fees_select_authenticated"
  on public.channel_fees
  for select
  to authenticated
  using (true);

create policy "channel_fees_insert_admin"
  on public.channel_fees
  for insert
  to authenticated
  with check (public.is_admin());

create policy "channel_fees_update_admin"
  on public.channel_fees
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.sales_channels to authenticated;
grant select, insert, update on public.channel_fees to authenticated;
