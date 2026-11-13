# Task — Unidade da quantidade na ficha técnica e equivalência de caixa

**Data:** 2026-11-13
**Status:** Concluída
**Origem:** relato do responsável — ao montar a ficha técnica, o administrador
informa a quantidade na unidade em que pensa ("6 unidades"), mas o insumo é
comprado em caixa; o sistema gravava "6 caixas" e o custo do produto saía
errado. Não existia cadastro de quantas unidades cabem numa caixa.

## Contexto

`product_components.quantity` é gravada na unidade base do insumo. O formulário
de produto aceitava apenas a quantidade, sem unidade, e o cadastro de insumo
não guardava a equivalência de caixa/pacote. A função
`convertStandardQuantity` existia em `src/services/calculations/units.ts` desde
a subetapa 5.4, mas era código morto.

Decisão: converter **na entrada** (no servidor, antes de gravar) e manter
sempre a unidade base — sem migration em `product_components`, sem alteração no
motor de custo e nas RPCs de costing.

## Correção

| Camada | Arquivo |
|--------|---------|
| Banco | `supabase/migrations/20261113110000_add_units_per_package_to_supplies.sql` (aplicada) — `supplies.units_per_package` (`numeric(12,6)`), check de valor positivo e de uso apenas em `caixa`/`pacote` |
| Motor | `src/services/calculations/units.ts` — `listConvertibleUnits`, `convertToBaseUnit`, `roundQuantity` (+ testes) |
| Cadastro de insumo | `src/features/supplies/{types,parse,payload}.ts`, `src/lib/validations/supplies.ts`, `src/features/supplies/SupplyForm.tsx` — campo "Unidades por caixa/pacote", exibido só em caixa/pacote |
| Catálogo | `src/services/supabase/supplies.ts` — `listSupplyUnitContexts`; `src/services/supabase/products.ts` — `listProductCatalog` envia `unitsPerPackage` |
| Validação | `src/lib/validations/products.ts` — `validateProduct(inputData, supplyContexts)` converte a quantidade para a unidade base (+ testes) |
| Server Action | `src/app/actions/products.ts` — carrega os contextos, valida e recusa insumo inexistente |
| Interface | `src/features/products/ProductForm.tsx` — seletor de unidade por linha, rótulo "Quantidade por unidade do produto", texto de equivalência; `ProductsPanel.tsx` — coluna "Composição por unidade" |

## Comportamento

- Insumo em caixa: `units_per_package = 12` → 1 caixa = 12 unidades.
- Ficha técnica com "6 unidades" → grava `0.5` na unidade base (caixa).
- Alternativas métricas: grama ↔ quilograma, mililitro ↔ litro.
- Unidade incompatível (ex.: litro em insumo de caixa) → recusada com a
  mensagem "Revise a unidade da quantidade: ela não corresponde ao insumo.".
- Insumo em caixa **sem** equivalência registrada continua válido e só aceita a
  própria unidade base.
- Arredondamento de três casas decimais, como o resto do sistema.

## Consequência aceita

A unidade escolhida não é gravada: o histórico da composição depende da
quantidade final e do custo do insumo, que já é snapshot. O contrato público de
`validateProduct` foi mantido — o contexto de unidades é um segundo parâmetro
opcional, e o caminho leniente (sem contexto) segue funcionando.

## Validação

- `npm run typecheck`, `npm run lint`, `npm test` (328 testes) verdes.
- Migration aplicada no Supabase e conferida em `information_schema.columns` e
  `pg_constraint`.
- Teste real pela interface (Server Actions com sessão de administrador):
  insumo em caixa com 12 unidades por caixa cadastrado; produto gravado com
  "6 unidades" e `product_components.quantity = 0.5`; unidade incompatível
  recusada. Temporários removidos ao final do teste.
