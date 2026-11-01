# Spec 000 — Fundação do projeto

**Etapa:** 1
**Status:** Implementado
**Última atualização:** 2026-11-01

## Objetivo

Entregar a base técnica do sistema administrativo: stack instalada, tipagem estrita,
lint, testes unitários de lógica, estilos globais por tokens, estrutura de pastas e
pipeline local de validação.

## Escopo entregue

- Next.js 16 (App Router) com TypeScript em modo `strict`.
- CSS Modules por componente; nenhum framework de utilidade CSS.
- ESLint configurado pelo `create-next-app`.
- Jest para testes unitários de lógica, ambiente `node`.
- Utilitário monetário em centavos com testes.
- Tela de boas-vindas em `/` confirmando a stack.
- Documentação de instalação e scripts.

## Fora de escopo

- Supabase, autenticação e banco de dados.
- Telas de módulos de negócio.
- Testes de componente, integração e E2E.

## Estrutura

```
src/
├── app/            rotas e layouts
├── components/     ui, layout, forms, tables, feedback
├── features/       products, supplies, production, pricing,
│                   inventory, expenses, settings
├── services/       supabase, calculations
├── lib/            auth, validations, constants, utils
├── hooks/
├── types/
└── styles/         variables.css, typography.css, globals.css
```

## Contratos técnicos

| Item | Regra |
|------|-------|
| Dinheiro | Sempre centavos inteiros; conversão só por `src/lib/utils/currency.ts` |
| Estilo global | Apenas tokens, reset e tipografia |
| Componente | Um `.tsx` + um `.module.css` por componente visual |
| Nome de função | camelCase, mínimo 4 caracteres, comentário com parâmetros e retorno |
| Tipagem | Proibido `any` e `@ts-ignore` |

## Scripts

| Comando | Efeito |
|---------|--------|
| `npm run dev` | Servidor local em `http://localhost:3000` |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com correção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Jest (unitário) |
| `npm run test:coverage` | Jest com cobertura |
| `npm run validate` | typecheck + lint + test |
| `./pre-push.sh` | Validação completa antes de concluir |

## Critérios de aceitação

- `npm run build` conclui sem erro.
- `npm run typecheck` sem erros.
- `npm run lint` sem erros nem avisos.
- `npm run test` verde.
- `/` renderiza a tela de boas-vindas.

## Validação executada

- `npm run build` — rota `/` estática gerada.
- `npm run typecheck` — sem saída de erro.
- `npm run lint` — sem saída de erro.
- `npm run test` — 1 suíte, 10 testes aprovados.

## Pendências

- Criar `.env.local` a partir de `.env.example` na Etapa 2.
- Configurar projeto Supabase e policies de RLS.
