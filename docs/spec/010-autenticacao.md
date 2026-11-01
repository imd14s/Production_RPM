# Spec 010 — Autenticação e acesso

**Etapa:** 2
**Status:** Implementado — validação de login pendente (provedor de e-mail desabilitado)
**Última atualização:** 2026-11-01

## Objetivo

Permitir que usuários cadastrados entrem no sistema, mantenham sessão e acessem apenas as
áreas permitidas pelo seu perfil. A aplicação **exibe dados** e **consome o Supabase**;
ela **não cria, não convida e não gerencia usuários**.

## Fronteira de responsabilidade (decisão do projeto)

| Atividade | Responsável |
|-----------|-------------|
| Criar usuário | **Painel do Supabase**, pelo administrador do projeto |
| Redefinir senha / desativar usuário | **Painel do Supabase** |
| Definir perfil (`administrador` / `operador`) | **Painel do Supabase** (coluna `profiles.role`) |
| Login, sessão e logout | Aplicação |
| Exibir dados conforme perfil | Aplicação |
| Aplicar regras no banco | Supabase (RLS) |

Consequências técnicas:

- A aplicação **não** usa `SUPABASE_SERVICE_ROLE_KEY`. Só a chave publicável
  (`sb_publishable_…`), que é protegida por RLS.
- Não existe tela de cadastro, convite, troca de senha ou gestão de usuários.
- Nenhum fluxo administrativo privilegiado é exposto no navegador.
- Cadastro público permanece **desabilitado** no Supabase.

## Escopo

- Tela de login em `src/app/(auth)/login` (e-mail + senha).
- Rotas privadas sob `src/app/(dashboard)`.
- Middleware de renovação de sessão e bloqueio de acesso anônimo.
- Logout.
- Perfil do usuário lido de `profiles`, com RLS.
- Redirecionamento de usuário autenticado que acessa `/login`.

## Fora de escopo

- Cadastro, convite e edição de usuários.
- Recuperação de senha pela aplicação.
- Login social.
- Testes de navegador (o projeto usa apenas testes unitários de lógica).

## Modelo de dados

```sql
create type public.user_role as enum ('administrador', 'operador');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.user_role not null default 'operador',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Regras:

- `profiles.id` espelha `auth.users.id`; o perfil é criado por gatilho no cadastro do
  usuário (feito no painel).
- `role` só pode ser alterado pelo painel do Supabase (RLS bloqueia escrita pelo app).
- `is_active = false` impede o uso do sistema mesmo com sessão válida.

## Políticas RLS

| Tabela | Operação | Regra |
|--------|----------|-------|
| `profiles` | `select` | Usuário lê o próprio perfil; administrador lê todos |
| `profiles` | `insert` / `update` / `delete` | Bloqueado para o app — feito no painel do Supabase |

Função auxiliar `public.is_admin()` em `security definer` para evitar recursão de policy.

## Fluxo de login

1. Usuário informa e-mail e senha.
2. Server Action valida os campos e chama `signInWithPassword`.
3. Sessão gravada em cookies `httpOnly` pelo `@supabase/ssr`.
4. Redireciona para `/home`.
5. Middleware renova o token e bloqueia rotas privadas sem sessão.

Erros exibidos sempre como "E-mail ou senha inválidos" — nunca revelar se o e-mail existe.

## Critérios de aceitação

- [ ] Acessar `/home` sem sessão redireciona para `/login`.
- [ ] Login válido abre o dashboard.
- [ ] Login inválido mostra mensagem genérica.
- [ ] Logout encerra a sessão e volta para `/login`.
- [ ] `is_active = false` bloqueia o acesso.
- [ ] Nenhuma chave secreta no bundle do navegador.
- [ ] `npm run typecheck`, `npm run lint` e `npm run test` verdes.

## Testes unitários previstos

- `getRedirectPath(isAuthenticated, isActive, role, pathname)` — decisão de rota.
- Normalização e validação de e-mail/senha do formulário.
- Mapeamento de erro do Supabase para mensagem de tela.
