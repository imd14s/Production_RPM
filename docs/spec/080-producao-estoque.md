# Spec 080 — Produção e estoque (Etapa 7)

**Status:** Removida do escopo (2026-11-03)
**Fonte de verdade:** `task.md`, seções "Produção" e "Estoque"

> **Decisão do responsável (2026-11-03):** o sistema não fará controle de
> unidade de produto produzido — é uma **planilha de cálculo de preço**. Os
> módulos de produção e estoque foram removidos do código e do banco
> (`supabase/migrations/20261103070000_drop_production_and_inventory.sql`,
> aplicada em 2026-11-03, com tabelas confirmadas vazias antes do drop).

## O que ficou

- O custo de fabricação continua calculável **sem** produção: material das
  fichas técnicas + mão de obra da ficha + despesas rateadas por volume
  **estimado** (`company_settings.monthly_output_units`), tudo no motor de
  cálculo (`spec 070`).
- Sem controle de estoque de insumos ou produtos acabados.
- Sem lotes, consumo real de produção, perdas ou movimentações.

## Sub-etapas

| Sub-etapa | Entrega | Situação |
|---|---|---|
| 7.1 | Lotes de produção | ❌ Removida |
| 7.2 | Consumo real de materiais | ❌ Removida |
| 7.3 | Perdas e acabamento | ➡️ Continua como custos diretos por produto (spec 060) |
| 7.4 | Movimentações de estoque | ❌ Removida |
| 7.5 | Saldo de estoque | ❌ Removido |
| 7.6 | UI de produção e estoque | ❌ Removida |

## Modelo de dados

As tabelas `production_batches`, `production_consumption` e
`inventory_movements` foram excluídas. As migrations que as criaram permanecem
no histórico (regra de não alterar migration aplicada); a remoção é uma
migration nova, aplicada em transação.