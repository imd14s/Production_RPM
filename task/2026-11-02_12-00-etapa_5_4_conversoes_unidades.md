# Etapa 5.4 — Conversões de unidades

**Data de Criação:** 2026-11-02 12:00
**Agente:** OpenCode — Beam Free
**Status:** Substituída por conversão métrica automática; cadastro manual removido
**Etapa:** 5 de 9 (ver `task.md`)

## Objetivo

Permitir o cadastro de fatores de conversão entre unidades de medida para um
insumo, para que, na precificação (Etapa 6), quantidades expressas em unidades
diferentes da unidade base possam ser convertidas sem cálculo manual. Esta etapa
apenas **cadastra e audita** conversões; não altera o motor de custo nem a
composição de produtos.

## Escopo

- Tabela `supply_unit_conversions` ligada ao insumo (`supply_id`).
- Cada conversão informa a unidade de origem, a unidade de destino e o fator
  (quantas unidades de destino existem em uma unidade de origem).
- Exclusão lógica (`is_active`), RLS e auditoria padrão.
- Validações testáveis, payload, parse, serviço, ações e UI.

## Modelo de dados

```sql
supply_unit_conversions (
  id uuid pk,
  supply_id uuid fk supplies on delete cascade,
  from_unit supply_unit,
  to_unit supply_unit,
  factor numeric(12,6) check (factor > 0),
  is_active boolean default true,
  notes text,
  created_at, updated_at
)
```

- `check (from_unit <> to_unit)`.
- Índice único `(supply_id, from_unit, to_unit)`.
- Gatilhos `set_updated_at` e `log_configuration_change`.

## Arquivos afetados

- `supabase/migrations/20261102140000_create_supply_unit_conversions.sql`
- `src/features/supplies/types.ts` (tipos de conversão)
- `src/features/supplies/parse.ts` (parse de conversão)
- `src/features/supplies/payload.ts` (payload de conversão)
- `src/lib/validations/supplies.ts` (validateUnitConversion)
- `src/services/supabase/supplies.ts` (list/save/setActive de conversões)
- `src/app/actions/supplies.ts` (actions)
- `src/features/supplies/UnitConversionsPanel.tsx` + css
- `src/features/supplies/UnitConversionForm.tsx` + css
- `src/app/(dashboard)/insumos/[id]/page.tsx`
- `docs/spec/040-cadastros.md`, `docs/spec/060-produtos.md`
- `docs/MASTER_INDEX.md`, `docs/MEMORIA.md`

## Validações

- Unidades válidas e distintas.
- Fator > 0, até 6 casas decimais, parse com vírgula.
- `supplyId` UUID válido.

## Critérios de aceite

- Conversões podem ser criadas, editadas e ativadas/desativadas por insumo.
- Referências circulares não se aplicam (conversão é par ordenado).
- Duplicidade `(supply, from, to)` rejeitada pelo banco.
- RLS e auditoria ativos.
- Typecheck, lint, testes e `./pre-push.sh` verdes.

## Pendências

- A migration histórica `20261102140000_create_supply_unit_conversions.sql` permanece
  inalterada; a aplicação não consulta nem grava nessa tabela.
- O comportamento atual está documentado em
  `task/2026-11-02_16-05-conversao-automatica-unidades-medida.md`.