# Spec 040 — Cadastros (Etapa 5)

**Status:** Em andamento — 5.1, 5.2 e 5.3 implementados no código; 5.4 pendente
**Fonte de verdade:** `task.md`, seção "Insumos" e "Cadastro de insumos e produtos"

## Sub-etapas

| Sub-etapa | Área | Tabelas |
|---|---|---|
| 5.1 | Fornecedores | `suppliers` |
| 5.2 | Insumos e aquisições (histórico de preços) | `supplies`, `supply_prices` | ✅ Implementada |
| 5.3 | Produtos, receitas e composições | `products`, `product_components` | ✅ Implementada |
| 5.4 | Conversões de unidades | `supply_unit_conversions` (a definir com ETAPA de composições) |

## Fornecedores (5.1)

- Migration `20261102100000_create_suppliers.sql`: documento como dígitos
  (11 ou 14, único quando preenchido), telefone como dígitos (10–11), e-mail
  opcional com formato básico, exclusão lógica, RLS e auditoria padrão.
- CPF e CNPJ aceitos; os dígitos verificadores são conferidos na validação
  (`lib/validations/suppliers.ts`, `isValidCpf`).
- Máscara `formatCpfOrCnpj` troca o formato sozinha conforme a quantidade de
  dígitos digitados.
- Tela `/fornecedores` (lista + formulário). Menu visível apenas ao administrador.
- Serviços em `services/supabase/suppliers.ts`, ações em `app/actions/suppliers.ts`.

## Insumos e aquisições (5.2)

- Migration `20261102110000_create_supplies.sql`: enums `supply_kind`
  (matéria-prima, revenda, impressão 3D, embalagem, outro) e `supply_unit`
  (unidade, metro, grama, quilograma, mililitro, litro, pacote, caixa, outro).
- `supply_prices`: uma linha por compra — data (`acquired_on`), fornecedor
  opcional, quantidade (numeric 3 casas, > 0), valor pago, frete; o
  **custo por unidade é snapshot** calculado pela aplicação
  (`calculateUnitCostCents` = arredondamento de `(valor + frete) / quantidade`),
  testado. Mudar preço não retroage custos de peças já vendidas.
- Quantidade com vírgula: `lib/quantity.ts` (`parseQuantityInput`, 3 casas).
- Telas: `/insumos` (lista com custo atual, data da última compra e link de
  compras) e `/insumos/[id]` (histórico completo de compras + registro; a
  compra mais recente é marcada como "Atual" e define o custo).
- Sem fornecedor na compra = "Compra avulsa"; fornecedor pode estar inativo e
  continua listado se for o dono da compra em edição.
- Serviços em `services/supabase/supplies.ts`; ações em `app/actions/supplies.ts`.

## Produtos e composições (5.3)

- Migrations `20261102120000_create_products.sql` e
  `20261102130000_product_composition_integrity.sql`.
- `products` guarda nome, modalidade, minutos de mão de obra, observações e
  situação lógica; `product_components` referencia um insumo ou outro produto
  com quantidade positiva de até três casas.
- Fabricados, revenda e impressão 3D podem usar insumos ou subprodutos; kits
  exigem ao menos um produto componente.
- RLS permite leitura autenticada e restringe escrita a administradores.
  Produto e composição são gravados atomicamente por RPC, com validação
  administrativa no servidor e no banco, auditoria e bloqueio de ciclos.
- Tela `/produtos` permite cadastrar, editar e ativar/desativar produtos; link
  disponível somente para administradores.
- Sem cálculo de custo ou preço de venda nesta etapa. Detalhes em
  [`060-produtos.md`](./060-produtos.md).

## Regras da etapa

- O preço do insumo vindo de cada compra não altera custos de peças já vendidas
  (snapshot do custo por unidade na própria compra).
- Fornecedor é opcional na compra (aquisições avulsas existem).

## Pendências

- Conversões de unidades (5.4).
