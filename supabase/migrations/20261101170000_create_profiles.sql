-- Perfis de acesso e políticas de RLS.
--
-- Decisão do projeto: a gestão de usuários (criar, desativar, redefinir senha e
-- definir perfil) é feita no painel do Supabase. A aplicação apenas autentica e
-- lê o perfil, portanto não existem políticas de INSERT, UPDATE ou DELETE.

create type public.user_role as enum ('administrador', 'operador');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  role public.user_role not null default 'operador',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de acesso vinculado a auth.users. Alterado apenas no painel do Supabase.';

alter table public.profiles enable row level security;

-- Cria o perfil automaticamente quando um usuário é cadastrado no painel.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Evita recursão de política ao consultar o próprio perfil.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'administrador'
      and is_active
  );
$$;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- Perfis para usuários que já existiam antes do gatilho.
insert into public.profiles (id, full_name)
select
  id,
  coalesce(
    nullif(btrim(raw_user_meta_data ->> 'full_name'), ''),
    split_part(email, '@', 1)
  )
from auth.users
on conflict (id) do nothing;
