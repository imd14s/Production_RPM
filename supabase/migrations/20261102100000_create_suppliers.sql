-- Fornecedores de insumos.
--
-- Pessoas ou empresas de onde vêm os materiais. O documento é opcional nas
-- compras avulsas, mas quando informado precisa ser um CPF ou CNPJ válido.
-- Documento e telefone vivem como dígitos; a máscara é preocupação da tela.

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  document text
    check (document is null
      or char_length(document) in (11, 14)),
  phone text
    check (phone is null or char_length(phone) between 10 and 11),
  email text
    check (email is null or (char_length(email) <= 120 and position('@' in email) > 1)),
  is_active boolean not null default true,
  notes text check (notes is null or char_length(btrim(notes)) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.suppliers is
  'Fornecedores de insumos do ateliê. Documento e telefone como dígitos, exclusão lógica via is_active.';

create unique index suppliers_name_key on public.suppliers (lower(btrim(name)));

create unique index suppliers_document_key
  on public.suppliers (document)
  where document is not null;

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row
  execute function public.set_updated_at();

create trigger suppliers_audit
  after insert or update or delete on public.suppliers
  for each row
  execute function public.log_configuration_change();

-- ---------------------------------------------------------------------------
-- RLS e permissões
-- ---------------------------------------------------------------------------

alter table public.suppliers enable row level security;

create policy "suppliers_select_authenticated"
  on public.suppliers
  for select
  to authenticated
  using (true);

create policy "suppliers_insert_admin"
  on public.suppliers
  for insert
  to authenticated
  with check (public.is_admin());

create policy "suppliers_update_admin"
  on public.suppliers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update on public.suppliers to authenticated;
