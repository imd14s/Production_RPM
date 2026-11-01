# Índice Central do Projeto

Mapa de contexto. Localize a área de atuação e leia a spec correspondente antes de
alterar código.

## Estado atual

- Etapa concluída: **1 — Fundação**
- Etapa em andamento: **nenhuma**
- Próxima etapa: **2 — Supabase e autenticação**

## Áreas

| Área | Pasta | Spec | Status |
|------|-------|------|--------|
| Fundação, stack, scripts e estilos base | `src/styles`, `src/lib/utils`, raiz | [`spec/000-fundacao.md`](./spec/000-fundacao.md) | Implementado |
| Autenticação, perfis e RLS | `src/app/(auth)`, `src/lib/auth`, `src/services/supabase` | `spec/010-autenticacao.md` | Não iniciado |
| Configurações da empresa e tributos | `src/features/settings`, `src/app/(dashboard)/configuracoes` | `spec/020-configuracoes.md` | Não iniciado |
| Canais e taxas de pagamento | `src/features/pricing`, `src/app/(dashboard)/precificacao` | `spec/030-canais.md` | Não iniciado |
| Insumos e fornecedores | `src/features/supplies`, `src/app/(dashboard)/insumos` | `spec/040-insumos.md` | Não iniciado |
| Produtos, receitas e kits | `src/features/products`, `src/app/(dashboard)/produtos` | `spec/050-produtos.md` | Não iniciado |
| Motor de precificação | `src/services/calculations` | `spec/060-precificacao.md` | Não iniciado |
| Produção e estoque | `src/features/production`, `src/features/inventory` | `spec/070-producao-estoque.md` | Não iniciado |
| Despesas e rateios | `src/features/expenses`, `src/app/(dashboard)/despesas` | `spec/080-despesas.md` | Não iniciado |
| Relatórios e indicadores | `src/app/(dashboard)/relatorios` | `spec/090-relatorios.md` | Não iniciado |

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
