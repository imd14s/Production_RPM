-- Configurações da empresa, impostos e histórico de alterações.
--
-- Decisões:
--   * dinheiro em centavos inteiros (bigint), nunca float;
--   * percentual em numeric(9,6), exato;
--   * empresa é linha única (id = 1);
--   * histórico é escrito por gatilho, não pela aplicação;
--   * exclusão lógica via is_active nas tabelas usadas por cálculo.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.company_type as enum ('mei', 'me', 'eireli', 'ltda', 'outro');
create type public.tax_regime as enum (
  'mei',
  'simples_nacional',
  'lucro_presumido',
  'lucro_real',
  'outro'
);
create type public.tax_kind as enum ('percentual', 'fixo');

-- ---------------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------------

-- Atualiza updated_at em cada alteração.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Registra a alteração em configuration_history.
-- Roda como definer para que nenhuma sessão possa forjar auditoria.
create or replace function public.log_configuration_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_id text;
begin
  changed_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');

  insert into public.configuration_history (
    table_name,
    record_id,
    operation,
    before_data,
    after_data,
    changed_by
  )
  values (
    tg_table_name,
    changed_id,
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    auth.uid()
  );

  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- Empresa
-- ---------------------------------------------------------------------------

create table public.company_settings (
  id smallint primary key default 1 check (id = 1),
  legal_name text not null check (char_length(btrim(legal_name)) between 2 and 160),
  trade_name text not null check (char_length(btrim(trade_name)) between 2 and 160),
  document text not null check (document ~ '^[0-9]{14}$'),
  company_type public.company_type not null default 'mei',
  tax_regime public.tax_regime not null default 'mei',
  cnae text check (cnae is null or char_length(btrim(cnae)) between 4 and 20),
  state_registration text check (
    state_registration is null or char_length(btrim(state_registration)) between 2 and 20
  ),
  municipal_registration text check (
    municipal_registration is null
    or char_length(btrim(municipal_registration)) between 2 and 20
  ),
  email text check (
    email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  phone text check (phone is null or char_length(regexp_replace(phone, '\D', '', 'g')) between 10 and 11),
  street text check (street is null or char_length(btrim(street)) between 2 and 160),
  number text check (number is null or char_length(btrim(number)) between 1 and 20),
  complement text check (complement is null or char_length(btrim(complement)) <= 80),
  district text check (district is null or char_length(btrim(district)) between 2 and 80),
  city text check (city is null or char_length(btrim(city)) between 2 and 80),
  state char(2) check (state is null or state ~ '^[A-Z]{2}$'),
  zip_code text check (zip_code is null or zip_code ~ '^[0-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.company_settings is
  'Dados cadastrais e fiscais do ateliê. Linha única (id = 1).';

-- ---------------------------------------------------------------------------
-- Impostos configuráveis
-- ---------------------------------------------------------------------------

create table public.tax_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  kind public.tax_kind not null,
  rate numeric(9, 6),
  amount_cents bigint,
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tax_settings_value_matches_kind check (
    (kind = 'percentual' and rate is not null and amount_cents is null)
    or (kind = 'fixo' and amount_cents is not null and rate is null)
  ),
  constraint tax_settings_rate_range check (rate is null or (rate >= 0 and rate <= 100)),
  constraint tax_settings_amount_non_negative check (
    amount_cents is null or amount_cents >= 0
  )
);

comment on table public.tax_settings is
  'Impostos configuráveis. Percentual ou valor fixo, nunca os dois.';

create unique index tax_settings_name_key on public.tax_settings (lower(btrim(name)));

-- ---------------------------------------------------------------------------
-- Histórico de alterações
-- ---------------------------------------------------------------------------

create table public.configuration_history (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id text not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  before_data jsonb,
  after_data jsonb,
  changed_by uuid references public.profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);

comment on table public.configuration_history is
  'Auditoria das tabelas de configuração. Escrita apenas pelo gatilho.';

create index configuration_history_record_idx
  on public.configuration_history (table_name, record_id, changed_at desc);

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row
  execute function public.set_updated_at();

create trigger company_settings_audit
  after insert or update or delete on public.company_settings
  for each row
  execute function public.log_configuration_change();

create trigger tax_settings_set_updated_at
  before update on public.tax_settings
  for each row
  execute function public.set_updated_at();

create trigger tax_settings_audit
  after insert or update or delete on public.tax_settings
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.company_settings enable row level security;
alter table public.tax_settings enable row level security;
alter table public.configuration_history enable row level security;

create policy "company_settings_select_authenticated"
  on public.company_settings
  for select
  to authenticated
  using (true);

create policy "company_settings_write_admin"
  on public.company_settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy "company_settings_update_admin"
  on public.company_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tax_settings_select_authenticated"
  on public.tax_settings
  for select
  to authenticated
  using (true);

create policy "tax_settings_insert_admin"
  on public.tax_settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy "tax_settings_update_admin"
  on public.tax_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "configuration_history_select_admin"
  on public.configuration_history
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Permissões de tabela
-- ---------------------------------------------------------------------------

grant select, insert, update on public.company_settings to authenticated;
grant select, insert, update on public.tax_settings to authenticated;
grant select on public.configuration_history to authenticated;
