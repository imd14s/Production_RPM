# Migrations

SQL versionado do banco. Aplicar sempre na ordem do nome do arquivo.

## Migrations

| Arquivo | Conteúdo |
|---------|----------|
| `20261101170000_create_profiles.sql` | `profiles`, `user_role`, gatilho de criação, `is_admin()` e RLS |

## Como aplicar

### Opção 1 — SQL Editor do painel (sem instalar nada)

1. Abra o projeto no painel do Supabase → **SQL Editor**.
2. Cole o conteúdo do arquivo e execute.
3. Confira em **Table Editor** se `profiles` existe e se o seu usuário aparece.

### Opção 2 — Supabase CLI

```bash
npx supabase db push --db-url "postgresql://postgres:SENHA@db.PROJETO.supabase.co:5432/postgres"
```

## Depois de aplicar

Promova o primeiro usuário a administrador no **Table Editor → profiles**,
alterando `role` para `administrador`. Ou, no SQL Editor:

```sql
update public.profiles
set role = 'administrador', updated_at = now()
where id = (select id from auth.users where email = 'SEU-EMAIL');
```

## Regras

- Nunca altere uma migration já aplicada: crie uma nova com data posterior.
- Toda tabela nova nasce com `alter table ... enable row level security` e políticas.
- A aplicação não escreve em `profiles`; gestão de usuários é feita no painel.
