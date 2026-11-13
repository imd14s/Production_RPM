# Task — Exclusão em cascata com aviso de dependências

**Data:** 2026-11-13
**Status:** Concluída
**Origem:** relato do responsável — ao excluir um insumo usado na ficha técnica de
um produto, o banco respondia "está em uso ou possui registros vinculados".

## Contexto

Depois de destravar a lixeira (task `2026-11-13_18-50-corrigir-exclusao-silenciosa.md`),
a exclusão passou a falhar de forma visível — mas de forma genérica. O insumo
"Cera Coco" é usado na ficha técnica do produto "Vela" e a FK
`product_components_supply_id_fkey` (ON DELETE NO ACTION) bloqueava a remoção.

O responsável decidiu: **excluir em cascata** e **avisar o que será removido**.

## Causa

| Referência | Antes | Depois |
|---|---|---|
| `product_components.supply_id` | NO ACTION | CASCADE |
| `product_components.component_product_id` | NO ACTION | CASCADE |
| `cost_snapshots.product_id` | RESTRICT | CASCADE |
| `pricing_simulations.product_id` | RESTRICT | CASCADE |
| `pricing_simulations.channel_id` | RESTRICT | CASCADE |
| `pricing_simulations.payment_method_id` | NO ACTION | CASCADE |
| `pricing_simulations.cost_snapshot_id` | RESTRICT | CASCADE |

`pricing_simulations.cost_snapshot_id` também foi alterada: sem isso, remover um
produto com custo registrado seria barrado pela simulação que aponta para o
snapshot.

## Correção

| Camada | Arquivo |
|--------|---------|
| Banco | `supabase/migrations/20261113100000_allow_cascade_delete_domain_dependencies.sql` (aplicada) |
| Textos puros | `src/lib/deleteWarnings.ts`, `src/lib/deleteConfirmation.ts` (+ testes) |
| Dependências | `src/services/supabase/deleteDependencies.ts` |
| Interface | `DeleteRowButton` com prop `warnings`; painéis de insumos, produtos, canais e meios de pagamento |

Exemplos de aviso na confirmação:

- insumo: "a ficha técnica do produto Vela deixa de usar este insumo"
- produto: "2 custos registrados do produto serão apagados",
  "1 simulação de precificação será apagada", "o produto sai da ficha técnica do kit Kit Vela"
- canal / meio de pagamento: "3 simulações de precificação serão apagadas"

## Consequência aceita

O custo registrado e as simulações de precificação ligados ao registro são
apagados junto. A desativação lógica (Desativar) segue disponível para quem
precisa preservar o histórico.

## Validação

- `npm run typecheck`, `npm run lint`, `npm test` (310 testes) e `./pre-push.sh` verdes.
- Interface real com sessão de administrador: insumo com composição excluído,
  composição removida em cascata e aviso presente no payload do servidor.
- Banco: policies e FKs de cascade verificadas em `pg_constraint`.
