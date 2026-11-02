# Spec 040 — Cadastros (Etapa 5)

**Status:** Em andamento — 5.1 (fornecedores) implementado
**Fonte de verdade:** `task.md`, seção "Insumos" e "Cadastro de insumos e produtos"

## Sub-etapas

| Sub-etapa | Área | Tabelas |
|---|---|---|
| 5.1 | Fornecedores | `suppliers` |
| 5.2 | Insumos e aquisições (histórico de preços) | `supplies`, `supply_prices` |
| 5.3 | Produtos, receitas e composições | `products`, `product_components` |
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

## Regras da etapa

- O preço do insumo vindo de cada compra não altera custos de peças já vendidas
  (snapshot do custo por unidade na própria compra).
- Fornecedor é opcional na compra (aquisições avulsas existem).

## Pendências

- Cadastro de insumos e de aquisições (5.2).
