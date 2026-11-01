# Ateliê Filhos de Aruanda — Sistema de Gestão e Precificação

Aplicação web **privada** e de uso interno para gestão de insumos, produtos, produção,
estoque, despesas e formação de preços. Não possui cadastro público: os usuários são
criados pelo administrador.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Supabase** — PostgreSQL, Auth, Row Level Security e Storage
- **Vercel** — hospedagem
- **CSS Modules** + CSS convencional (sem Tailwind)
- **Jest** — testes unitários de lógica

## Requisitos

- Node.js 20.9 ou superior
- npm 10 ou superior

## Instalação

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do Supabase
npm run dev
```

Acesse <http://localhost:3000>.

> A Etapa 1 não usa o Supabase. As variáveis ficam vazias até a Etapa 2.

## Scripts

| Comando | Efeito |
|---------|--------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com correção automática |
| `npm run typecheck` | Verificação de tipos (`tsc --noEmit`) |
| `npm run test` | Testes unitários |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com cobertura |
| `npm run validate` | typecheck + lint + test |
| `./pre-push.sh` | Validação completa antes de concluir |

## Estrutura

```
src/
├── app/            rotas, layouts e Server Actions
├── components/     ui, layout, forms, tables, feedback
├── features/       products, supplies, production, pricing,
│                   inventory, expenses, settings
├── services/       supabase, calculations
├── lib/            auth, validations, constants, utils
├── hooks/
├── types/
└── styles/         variables.css, typography.css, globals.css
docs/
├── MEMORIA.md      decisões, bugs e lições aprendidas
├── MASTER_INDEX.md mapa de áreas e specs
└── spec/           especificação por domínio
task/               tasks e status
```

Cada componente visual tem seu par `.tsx` + `.module.css`. Regra de negócio não vive
dentro de componente, e cálculo financeiro não vive fora de `src/services/calculations`.

## Documentação

- [`task.md`](./task.md) — especificação do produto e plano por etapas (fonte de verdade)
- [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md) — regras de trabalho
- [`docs/MASTER_INDEX.md`](./docs/MASTER_INDEX.md) — mapa de áreas
- [`docs/MEMORIA.md`](./docs/MEMORIA.md) — memória do projeto

## Status

- [x] Etapa 1 — Fundação
- [ ] Etapa 2 — Supabase e autenticação
- [ ] Etapa 3 — Identidade visual e estrutura
- [ ] Etapa 4 — Configurações empresariais
- [ ] Etapa 5 — Insumos e produtos
- [ ] Etapa 6 — Motor de precificação
- [ ] Etapa 7 — Produção e estoque
- [ ] Etapa 8 — Relatórios
- [ ] Etapa 9 — Publicação

## Licença

A definir.
