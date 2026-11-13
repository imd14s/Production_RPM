# Índice Central do Projeto

Mapa de contexto. Localize a área de atuação e leia a spec correspondente antes de
alterar código.

> **Posicionamento (2026-11-03):** o sistema é uma **planilha de cálculo de preço**:
> insumos → produto → custo completo de fabricação → preço sugerido por plataforma.
> Módulos de controle de produção e estoque de itens acabados foram **removidos**.

## Estado atual

- Etapas concluídas: **1 — Fundação**, **2 — Autenticação**, **3 — Identidade visual e estrutura**
- Etapa 4 — Configurações: implementada (empresa, tributos, canais, meios de pagamento, despesas fixas, mão de obra, parâmetros de rateio e margens)
- Etapa 5 — Cadastros: implementada; migrations aplicadas ao Supabase
- Etapa 6 — Motor de precificação: implementada (motor, simulações, matriz na home, impacto de insumo); migrations aplicadas
- Etapa 7 — Produção e estoque: **removida do escopo** (2026-11-03); tabelas dropadas
- Etapa 8 — Relatórios: implementada no código
- Etapa 9 — Publicação: planejada, aguardando aprovação

## Áreas

| Área | Pasta | Spec | Status |
|------|-------|------|--------|
| Fundação, stack, scripts e estilos base | `src/styles`, `src/lib/utils`, raiz | [`spec/000-fundacao.md`](./spec/000-fundacao.md) | Implementado |
| Autenticação, perfis e RLS | `src/app/(auth)`, `src/lib/auth`, `src/services/supabase` | [`spec/010-autenticacao.md`](./spec/010-autenticacao.md) | Implementado |
| Identidade visual, layout e componentes base | `src/components`, `src/lib/navigation.ts`, `src/app/(dashboard)` | [`spec/020-identidade-visual.md`](./spec/020-identidade-visual.md) | Implementado |
| Configurações (empresa, tributos, canais, pagamentos, despesas, mão de obra, rateio) | `src/features/settings`, `src/features/channels`, `src/features/payments`, `src/features/costs`, `src/features/expenses`, `src/app/(dashboard)/configuracoes` | [`spec/030-configuracoes.md`](./spec/030-configuracoes.md) | Implementado |
| Fornecedores | `src/features/suppliers`, `src/app/(dashboard)/fornecedores` | [`spec/040-cadastros.md`](./spec/040-cadastros.md) | Implementado |
| Insumos e custo atual | `src/features/supplies`, `src/app/(dashboard)/insumos` | [`spec/040-cadastros.md`](./spec/040-cadastros.md) | Implementado — custo único por insumo |
| Produtos, receitas, kits e custos diretos (3D) | `src/features/products`, `src/app/(dashboard)/produtos` | [`spec/060-produtos.md`](./spec/060-produtos.md) | Implementado |
| Motor de precificação e matriz na home | `src/services/calculations`, `src/features/pricing`, `src/app/(dashboard)/precificacao`, `home` | [`spec/070-precificacao.md`](./spec/070-precificacao.md) | Implementado |
| Relatórios e indicadores | `src/features/reports`, `src/app/(dashboard)/relatorios` | [`spec/100-relatorios.md`](./spec/100-relatorios.md) | Implementado no código |
| Publicação | `vercel`, `supabase` | [`spec/110-publicacao.md`](./spec/110-publicacao.md) | Planejada — aguardando aprovação |

Removidas (2026-11-03): Produção e estoque — ver [`spec/080-producao-estoque.md`](./spec/080-producao-estoque.md)
(histórico e resultado do drop). As specs 090 (despesas) e de canais foram absorvidas por
[`spec/030-configuracoes.md`](./spec/030-configuracoes.md).

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
