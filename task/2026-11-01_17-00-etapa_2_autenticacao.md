# Etapa 2 — Autenticação e acesso

**Data de Criação:** 2026-11-01 17:00
**Agente:** OpenCode — DeepSeek V4.1 Flash Free
**Status:** Implementação concluída; migration pendente de aplicação
**Etapa:** 2 de 9 (ver `task.md`)

## Objetivo

Permitir login com e-mail e senha, manter sessão, bloquear rotas privadas e exibir os
dados do perfil autenticado. A criação e a gestão de usuários ficam no painel do
Supabase.

## Decisões

1. **Sem `service_role`** — a aplicação usa apenas a chave publicável.
2. **`profiles` é somente leitura para o app** — RLS permite `select` do próprio perfil e
   do conjunto quando o usuário é administrador. Sem `insert`, `update` ou `delete`.
3. **`proxy.ts`** (não `middleware.ts`) — o Next.js 16 renomeou a convenção.
4. **`instant = false`** nas rotas que dependem de sessão — exigência do Cache Components.
5. **Conta inativa** → `/auth/signout` (Route Handler limpa cookies) → `/login?motivo=inativo`,
   evitando laço de redirecionamento.

## Arquivos criados

### Serviços e regras

- `src/lib/env.ts` — leitura validada das variáveis públicas.
- `src/lib/auth/guards.ts` — rotas públicas, decisão de redirecionamento, validação de login.
- `src/lib/auth/messages.ts` — tradução segura dos erros do Supabase Auth.
- `src/lib/auth/session.ts` — usuário + perfil, com `cache()` por requisição.
- `src/types/auth.ts` — `UserRole`, `UserProfile`, `parseProfile`, `describeRole`.
- `src/services/supabase/client.ts` — cliente do navegador.
- `src/services/supabase/server.ts` — cliente de Server Components e Actions.
- `src/services/supabase/proxy.ts` — renovação de sessão no proxy.

### Rotas e telas

- `src/proxy.ts` — proteção de rotas e renovação de token.
- `src/app/(auth)/login/page.tsx` + `login.module.css` — tela de login.
- `src/app/(auth)/login/LoginForm.tsx` + `LoginForm.module.css` — formulário.
- `src/app/(dashboard)/layout.tsx` + `layout.module.css` — shell autenticado + logout.
- `src/app/(dashboard)/home/page.tsx` + `home.module.css` — página inicial real.
- `src/app/auth/signout/route.ts` — encerramento de sessão por Route Handler.
- `src/app/actions/auth.ts` — `signInAction` e `signOutAction`.
- `src/app/page.tsx` — `/` redireciona para `/home`.

### Banco

- `supabase/migrations/20261101170000_create_profiles.sql` — `user_role`, `profiles`,
  gatilho, `is_admin()`, RLS e backfill.
- `supabase/README.md` — como aplicar e como promover o administrador.

### Testes

- `src/lib/auth/guards.test.ts` — 8 casos.
- `src/lib/auth/messages.test.ts` — 4 casos.
- `src/types/auth.test.ts` — 6 casos.
- `src/types/roles.test.ts` — 2 casos.
- Total do projeto: **33 testes**.

## Validação executada

```bash
npm run typecheck   # ok
npm run lint        # ok (zero avisos)
npm run test        # 33 testes aprovados
npm run build       # / estática; /home, /login e /auth/signout dinâmicas; proxy ativo
```

## Pendência bloqueante

A migration não pôde ser aplicada por linha de comando: a conexão direta
(`db.<ref>.supabase.co`) resolve apenas em IPv6 e a rede local não tem rota IPv6.

Aplicar pelo **SQL Editor** do painel ou informar a string do **Session Pooler**.

Depois disso:

1. Promover o primeiro usuário a `administrador`.
2. Testar login, logout e rota protegida no navegador.
