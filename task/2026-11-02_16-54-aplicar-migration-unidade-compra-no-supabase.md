# Aplicar migration da unidade de compra no Supabase

**Data de criação:** 2026-11-02 16:54
**Agente:** Copilot SDK in VS Code
**Status:** Concluída e verificada

## Objetivo

Investigar `PGRST204` ao salvar aquisição, confirmar a coluna no banco remoto e aplicar
a migration correspondente se estivesse ausente.

## Resultado

- `public.supply_prices` não tinha `purchase_unit`; o nome enviado pelo código coincide
  com o nome definido pela migration, sem renomeação divergente.
- A migration foi aplicada em uma transação PostgreSQL. Ela preencheu a unidade de uma
  aquisição existente a partir de `supplies.unit` e tornou a coluna `NOT NULL`.
- Foi enviada a notificação `NOTIFY pgrst, 'reload schema'`.
- Corrigida por migration adicional a descrição do banco, que dizia incorretamente que
  o custo unitário é normalizado no banco para a unidade base.

## Validação

- PostgreSQL: coluna `purchase_unit` do tipo `supply_unit`, `NOT NULL`; 1 de 1 compras
  preenchida; nenhuma nula.
- PostgREST: requisição com chave pública selecionando `purchase_unit` retornou HTTP 200.
- A descrição de `unit_cost_cents` agora registra que o custo é armazenado na unidade
  comprada e só é convertido pela aplicação quando há equivalência conhecida.
- A tabela `supabase_migrations.schema_migrations` não existe neste banco; por isso a
  aplicação foi registrada neste documento e em `docs/MEMORIA.md`.
