# Etapa 7 — Produção e estoque

**Data de Criação:** 2026-11-02 14:00
**Agente:** OpenCode — Beam Free
**Status:** ✅ Implementada no código; migrations aplicadas no Supabase
**Etapa:** 7 de 9 (ver `task.md`)

## Objetivo

Implementar o registro de produção em lotes e as movimentações de estoque,
com histórico imutável e RLS.

## Sub-etapas propostas

1. 7.1 Modelagem do ERD e migrations.
2. 7.2 Lotes de produção.
3. 7.3 Consumo real de materiais.
4. 7.4 Perdas e acabamento.
5. 7.5 Movimentações de estoque.
6. 7.6 Saldo de estoque.
7. 7.7 UI `/producao` e `/estoque`.

## Áreas afetadas

- `src/features/production/`, `src/features/inventory/`
- `src/app/(dashboard)/producao/`, `/estoque/`
- `src/services/supabase/`
- `supabase/migrations/`
- `docs/spec/080-producao-estoque.md`

## Pendências de modelagem

- Detalhar ERD antes de criar migrations.
- Confirmar escopo de estoque (insumos e/ou produtos acabados).