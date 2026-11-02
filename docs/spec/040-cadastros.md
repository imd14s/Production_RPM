# Spec 040 — Cadastros (Etapa 5)

**Status:** Em andamento — 5.1 a 5.3 implementados; conversão métrica automática implementada
**Fonte de verdade:** `task.md`, seção "Insumos" e "Cadastro de insumos e produtos"

## Sub-etapas

| Sub-etapa | Área | Tabelas |
|---|---|---|
| 5.1 | Fornecedores | `suppliers` | ✅ Implementada |
| 5.2 | Insumos e aquisições (histórico de preços) | `supplies`, `supply_prices` | ✅ Implementada |
| 5.3 | Produtos, receitas e composições | `products`, `product_components` | ✅ Implementada |
| 5.4 | Conversão automática de unidades métricas | — | ✅ Implementada |

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
  opcional, quantidade comprada (numeric 3 casas, > 0), unidade original
  (`purchase_unit`), valor pago e frete. A migration
  `20261102200000_add_purchase_unit_to_supply_prices.sql` preenche compras
  existentes com a unidade base do insumo antes de exigir o novo campo.
- Cada aquisição salva quantidade e unidade escolhidas (`purchase_unit`), sem
  exigir compatibilidade com a unidade cadastrada no insumo. O seletor oferece
  kg, g, L, unidade e outro; unidades históricas já registradas continuam
  disponíveis ao editar a compra correspondente.
- O snapshot `unit_cost_cents` é calculado por quantidade comprada e sua unidade.
  Quando é possível determinar o custo na unidade base (mesma unidade ou
  conversão métrica do mesmo tipo), a lista de insumos usa esse custo. Quando as
  unidades não são comparáveis, a compra é salva e exibida no histórico, mas não
  fornece custo para a precificação do produto.
- Mudar preço depois da compra não altera o custo salvo nessa aquisição nem custos
  históricos de peças já vendidas.
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

## Unidades da compra (5.4)

- O seletor oferece kg, g, L, unidade e outro sem filtrar opções pela unidade
  base do insumo.
- A compra persiste exatamente quantidade, unidade, valor e frete informados.
- Conversões métricas podem ser usadas apenas para apresentar custo na unidade
  base quando forem compatíveis; a compra não é bloqueada por falta de conversão.
- Não existe tela para cadastrar fatores manuais. A tabela de conversões
  anterior permanece legada e não é consultada nem escrita pela aplicação.

## Regras da etapa

- O preço do insumo vindo de cada compra não altera custos de peças já vendidas
  (snapshot do custo por unidade na própria compra).
- Fornecedor é opcional na compra (aquisições avulsas existem).
- A quantidade histórica permanece na unidade original da compra; o custo
  unitário do snapshot é expresso na unidade base do insumo após conversão métrica.

## Pendências

- Aplicação das migrations necessárias da Etapa 5 no Supabase, incluindo a
  migration de `purchase_unit` (ação manual). A tabela legada de conversões
  manuais não é utilizada pela aplicação.
