# Fundação do projeto

**Data de Criação:** 2026-11-01 16:30
**Agente:** OpenCode — DeepSeek V4.1 Flash Free
**Status:** Concluída
**Etapa:** 1 de 9 (ver `task.md`)

## Objetivo

Criar a base técnica do sistema administrativo, sem telas fictícias: Next.js com App
Router, TypeScript estrito, CSS Modules, ESLint, Jest para testes unitários de lógica,
estrutura de pastas e pipeline local de validação.

## Decisões

1. **Sem worktree** — trabalho direto na `dev`; `main` intocada.
2. **Somente testes unitários de lógica** — Jest em ambiente `node`, sem Testing
   Library, sem MSW, sem Playwright.
3. **Sem Tailwind** — CSS Modules + CSS convencional com tokens em `src/styles/`.
4. **Sem backend independente** — toda a camada de servidor vive no Next.js.

## Scaffold

Gerado com `create-next-app` em diretório temporário (nome de pacote minúsculo), pois o
diretório do repositório contém maiúsculas:

```bash
npx create-next-app@latest atelie-admin \
  --ts --eslint --app --src-dir --import-alias "@/*" \
  --use-npm --no-tailwind --no-agents-md --disable-git --yes
```

Versões: Next.js 16.4.3, React 19.3.0, TypeScript 5.x (strict), ESLint 9.

## Arquivos criados

### Configuração

- `package.json` — nome `atelie-filhos-de-aruanda`, scripts `dev`, `build`, `start`,
  `lint`, `lint:fix`, `typecheck`, `test`, `test:watch`, `test:coverage`, `validate`.
- `jest.config.ts` — `next/jest`, ambiente `node`, `testMatch` em `src/**/*.test.ts`.
- `pre-push.sh` — typecheck + lint + test.
- `.env.example` — variáveis do Supabase (Etapa 2).
- `.gitignore` — libera `.env.example`, ignora `.env*`, `.next`, `coverage`.

### Aplicação

- `src/app/layout.tsx` — metadados pt-BR, fontes Geist, import dos estilos globais.
- `src/app/page.tsx` + `src/app/page.module.css` — tela de boas-vindas.
- `src/styles/variables.css` — tokens de cor, espaço, raio, sombra e tipografia.
- `src/styles/typography.css` — escala tipográfica.
- `src/styles/globals.css` — reset e base.

### Estrutura vazia (pronta para as próximas etapas)

- `src/app/(auth)/login`
- `src/app/(dashboard)`
- `src/components/{ui,layout,forms,tables,feedback}`
- `src/features/{products,supplies,production,pricing,inventory,expenses,settings}`
- `src/services/{supabase,calculations}`
- `src/lib/{auth,validations,constants}`
- `src/hooks`, `src/types`

### Lógica e testes

- `src/lib/utils/currency.ts` — `toCents`, `fromCents`, `sumCents`, `formatBRL`.
- `src/lib/utils/currency.test.ts` — 10 casos, incluindo entradas inválidas.

### Documentação

- `docs/MEMORIA.md` — decisões e armadilhas da fundação.
- `docs/MASTER_INDEX.md` — mapa de áreas e specs.
- `docs/spec/000-fundacao.md` — spec desta etapa.
- `README.md` — instalação, scripts e estrutura.

## Comandos executados

```bash
npm install
npm run typecheck   # ok
npm run lint        # ok
npm run test        # 10 testes aprovados
npm run build       # rota "/" gerada como estática
```

## Critérios de aceitação

- [x] Build de produção sem erro
- [x] Tipagem estrita sem erro
- [x] Lint sem erro nem aviso
- [x] Testes unitários verdes
- [x] `/` exibe a tela de boas-vindas
- [x] Estrutura de pastas conforme `task.md`

## Pendências

- Etapa 2: projeto Supabase, `profiles`, políticas RLS, login e administrador inicial.
- Criar `.env.local` a partir de `.env.example`.
