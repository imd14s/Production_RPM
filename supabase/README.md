# Migrations

SQL versionado do banco. Aplicar sempre na ordem do nome do arquivo.

## Migrations

| Arquivo | Conteúdo |
|---------|----------|
| `20261101170000_create_profiles.sql` | `profiles`, `user_role`, gatilho de criação, `is_admin()` e RLS |
| `20261102100000_create_suppliers.sql` | Fornecedores, auditoria, exclusão lógica e RLS |
| `20261102110000_create_supplies.sql` | Insumos, histórico de aquisições, snapshots de custo e RLS |
| `20261102120000_create_products.sql` | Produtos, modalidades, componentes, auditoria e RLS |
| `20261102130000_product_composition_integrity.sql` | Integridade de kits, proteção contra ciclos e gravação transacional de fichas |
| `20261102140000_create_supply_unit_conversions.sql` | Conversões de unidade por insumo, RLS e auditoria |
| `20261102150000_create_cost_snapshots.sql` | Snapshots imutáveis de custo de produto |
| `20261102160000_create_pricing_simulations.sql` | Simulações de precificação por canal e modalidade |
| `20261102170000_create_production_batches.sql` | Lotes de produção |
| `20261102180000_create_production_consumption.sql` | Consumo de materiais por lote |
| `20261102190000_create_inventory_movements.sql` | Movimentações de estoque |
| `20261102200000_add_purchase_unit_to_supply_prices.sql` | Unidade original de cada compra de insumo |
| `20261102210000_document_purchase_unit_cost_basis.sql` | Documenta a unidade de referência do custo unitário da compra |

## Como aplicar

### Opção 1 — SQL Editor do painel (sem instalar nada)

1. Abra o projeto no painel do Supabase → **SQL Editor**.
2. Execute o conteúdo das migrations da tabela acima, uma por vez e na ordem.
3. Confira em **Table Editor** se `profiles`, `suppliers`, `supplies`,
   `products` e `product_components` existem.

### Opção 2 — Supabase CLI / conexão direta

Este projeto fica na região **ca-central-1**. A conexão direta
(`db.<ref>.supabase.co`) resolve apenas em IPv6 e falha em redes IPv4. Use o
**Session Pooler**:

```bash
npx supabase db push --db-url "postgresql://postgres.fohqznrdiyudnquynkdt:SENHA@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
```

O host e a porta podem ser confirmados em **Dashboard → Connect → Direct →
Session pooler**.

## Depois de aplicar

Promova o primeiro usuário a administrador no **Table Editor → profiles**,
alterando `role` para `administrador`. Ou, no SQL Editor:

```sql
update public.profiles
set role = 'administrador', updated_at = now()
where id = (select id from auth.users where email = 'SEU-EMAIL');
```

## Regras

- Nunca altere uma migration já aplicada: crie uma nova com data posterior.
- Toda tabela nova nasce com `alter table ... enable row level security` e políticas.
- A aplicação não escreve em `profiles`; gestão de usuários é feita no painel.
- A migration de produtos deve ser aplicada depois das migrations de fornecedores e
  insumos, pois `product_components` referencia ambas as tabelas.
