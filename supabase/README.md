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

### Opção 2 — Supabase CLI / conexão direta

Este projeto fica na região **ca-central-1**. A conexão direta
(`db.<ref>.supabase.co`) resolve apenas em IPv6 e falha em redes IPv4. Use o
**Session Pooler**:

```bash
npx supabase db push --db-url "postgresql://postgres.fohqznrdiyudnquynkdt:SENHA@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
```

O host e a porta podem ser confirmados em **Dashboard → Connect → Direct →
Session pooler**.

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
