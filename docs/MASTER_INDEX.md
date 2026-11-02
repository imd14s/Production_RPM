# Índice Central do Projeto

Mapa de contexto. Localize a área de atuação e leia a spec correspondente antes de
alterar código.

## Estado atual

- Etapas concluídas: **1 — Fundação**, **2 — Autenticação**, **3 — Identidade visual e estrutura**
- Etapa 4 — Configurações empresariais: 4.1 a 4.4 implementados
- Etapa 5 — Cadastros: concluída (código + migrations aplicadas)
- Etapa 6 — Motor de precificação: implementada no código (motor, simulações, UI); migrations aplicadas
- Etapa 7 — Produção e estoque: implementada no código; migrations aplicadas

## Áreas

| Área | Pasta | Spec | Status |
|------|-------|------|--------|
| Fundação, stack, scripts e estilos base | `src/styles`, `src/lib/utils`, raiz | [`spec/000-fundacao.md`](./spec/000-fundacao.md) | Implementado |
| Autenticação, perfis e RLS | `src/app/(auth)`, `src/lib/auth`, `src/services/supabase` | [`spec/010-autenticacao.md`](./spec/010-autenticacao.md) | Implementado |
| Identidade visual, layout e componentes base | `src/components`, `src/lib/navigation.ts`, `src/app/(dashboard)` | [`spec/020-identidade-visual.md`](./spec/020-identidade-visual.md) | Implementado |
| Configurações da empresa e tributos | `src/features/settings`, `src/features/channels`, `src/features/payments`, `src/features/costs`, `src/app/(dashboard)/configuracoes` | [`spec/030-configuracoes.md`](./spec/030-configuracoes.md) | Em andamento — 4.1 a 4.4 implementados |
| Canais e taxas de pagamento | `src/features/pricing`, `src/app/(dashboard)/precificacao` | `spec/040-canais.md` | Não iniciado |
| Fornecedores | `src/features/suppliers`, `src/app/(dashboard)/fornecedores` | [`spec/040-cadastros.md`](./spec/040-cadastros.md) | 5.1 implementado |
| Insumos, aquisições e conversões | `src/features/supplies`, `src/app/(dashboard)/insumos` | [`spec/040-cadastros.md`](./spec/040-cadastros.md) | 5.2 e 5.4 implementados no código; migrations pendentes |
| Produtos, receitas e kits | `src/features/products`, `src/app/(dashboard)/produtos` | [`spec/060-produtos.md`](./spec/060-produtos.md) | 5.3 implementado no código; migration pendente |
| Motor de precificação | `src/services/calculations` | [`spec/070-precificacao.md`](./spec/070-precificacao.md) | Planejada — aguardando aprovação |
| Produção e estoque | `src/features/production`, `src/features/inventory` | [`spec/080-producao-estoque.md`](./spec/080-producao-estoque.md) | Planejada — aguardando aprovação |
| Despesas e rateios | `src/features/expenses`, `src/app/(dashboard)/despesas` | `spec/090-despesas.md` | Não iniciado |
| Relatórios e indicadores | `src/app/(dashboard)/relatorios` | `spec/100-relatorios.md` | Não iniciado |

> Specs marcadas como "não iniciado" ainda não existem e devem ser criadas na etapa
> correspondente, antes do código.

## Arquitetura em uma frase

Next.js (App Router) concentra telas e servidor; o Supabase entrega banco, autenticação e
RLS; cálculos financeiros vivem em `src/services/calculations`, isolados da interface e
cobertos por testes unitários.

## Fonte de verdade

`task.md` → `docs/spec/` → testes → código.

## Referências

| Documento | Conteúdo |
|-----------|----------|
| [`visual.md`](../visual.md) | Identidade visual: paleta, tipografia, formas e organização. Base dos tokens de `src/styles/variables.css` e da Etapa 3. |
| [`MEMORIA.md`](./MEMORIA.md) | Decisões, bugs e lições aprendidas. |
