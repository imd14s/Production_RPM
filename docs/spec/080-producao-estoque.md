# Spec 080 — Produção e estoque (Etapa 7)

**Status:** Planejada (aguardando aprovação)
**Fonte de verdade:** `task.md`, seções "Produção" e "Estoque"

## Objetivo

Registrar a produção em lotes (consumo real de materiais, perdas, mão de obra,
energia, depreciação) e as movimentações de estoque (entradas, saídas,
consumo, perdas, ajustes), mantendo o histórico imutável.

## Sub-etapas

| Sub-etapa | Entrega | Tabelas |
|---|---|---|
| 7.1 | Lotes de produção | `production_batches` |
| 7.2 | Consumo real de materiais | `production_consumption` |
| 7.3 | Perdas e acabamento | campos em `production_batches` |
| 7.4 | Movimentações de estoque | `inventory_movements` |
| 7.5 | Saldo de estoque por insumo/produto | view ou cálculo |
| 7.6 | UI de produção e estoque | `/producao`, `/estoque` |

## Regras

- Exclusão lógica onde houver histórico.
- RLS em todas as tabelas.
- Auditoria padrão.
- Imutabilidade do histórico de movimentações.

## Pendências de modelagem

- Definir estrutura exata de `production_batches` e `production_consumption`.
- Definir tipos de movimentação de estoque.
- Definir se o estoque é de insumos, produtos acabados ou ambos.