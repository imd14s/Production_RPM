# Spec 040 — Cadastros (Etapa 5)

**Status:** Implementada — migrations aplicadas ao Supabase
**Fonte de verdade:** `task.md`, seção "Insumos" e "Cadastro de insumos e produtos"

## Sub-etapas

| Sub-etapa | Área | Tabelas |
|---|---|---|
| 5.1 | Fornecedores | `suppliers` | ✅ Implementada |
| 5.2 | Insumos e custo atual | `supplies` | ✅ Implementada |
| 5.3 | Produtos, receitas e composições | `products`, `product_components` | ✅ Implementada |

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

## Insumos e custo atual (5.2)

- Migration inicial `20261102110000_create_supplies.sql`: enums `supply_kind`
  (matéria-prima, revenda, impressão 3D, embalagem, outro) e `supply_unit`
  (unidade, metro, grama, quilograma, mililitro, litro, pacote, caixa, outro).
- O registro `supplies` guarda os dados do insumo e da compra atual: quantidade
  na unidade base, data, valor pago, frete e custo por unidade em centavos.
- Não há histórico de aquisições. Editar esses dados substitui o custo atual do
  insumo; snapshots já registrados em custos de produção/precificação não são
  alterados retroativamente.
- Um único formulário cria e edita o insumo e seus dados atuais de custo.
  Observação é o último campo. A quantidade sempre usa a unidade do insumo;
  não existe campo ou conversão de unidade da compra.
- A data vazia usa o dia atual. Quantidade aceita vírgula e até três casas
  decimais (`lib/quantity.ts`, `parseQuantityInput`). Dinheiro é salvo em
  centavos inteiros.
- O custo unitário é calculado como
  `(valor pago + frete) / quantidade`, com arredondamento para centavos.
- A lista `/insumos` exibe a unidade base e o custo por unidade. Insumos sem
  custo atual são exibidos sem custo, não como erro de conversão.
- Serviços em `services/supabase/supplies.ts`; gravação administrativa em
  `app/actions/supplies.ts`, protegida por verificação de perfil e RLS.
- Fornecedores continuam cadastrados em seu módulo próprio; a compra atual de
  insumo não mantém referência de fornecedor.

### Migração do histórico existente

- A migration `20261102230000_replace_supply_price_history_with_current_cost.sql`
  copia somente a aquisição mais recente por insumo.
- Quantidades iguais à unidade base são mantidas; conversões métricas conhecidas
  entre kg/g e L/ml são normalizadas para a unidade base.
- Quantidades incompatíveis, nulas após arredondamento ou fora do limite seguro
  não são convertidas: os campos de custo daquele insumo permanecem vazios para
  preenchimento no formulário.
- A migration remove `supply_prices` e a função
  `create_supply_with_initial_price`. Migrations anteriores permanecem imutáveis.

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

## Conversões de unidade

- Quantidades usadas e compradas são sempre expressas na unidade base selecionada
  no insumo. Conversões métricas automáticas (kg↔g, L↔ml) são aceitas.
- Não há formulário para cadastrar fatores de conversão. A tabela legada de
  conversões manuais permanece fora dos fluxos ativos da aplicação.

## Pendências

Nenhuma pendência registrada nesta spec. As migrations de cadastro foram
aplicadas ao Supabase em 2026-11-03 e confirmadas pelo PostgREST.
