# Task — Popup de custo do produto na home

**Data:** 2026-11-13
**Status:** Concluída
**Origem:** relato do responsável — ao clicar no produto na tabela da home, abrir
um popup com o detalhamento: o valor de cada insumo já dividido pelo que foi
usado naquele produto e o gasto total. Exemplo: insumo com 2 velas por R$ 10,00
e uso de 1 vela → "1 vela — R$ 5,00".

## Contexto

A home mostra o custo de fabricação por produto, mas não como esse custo foi
montado. O responsável não conseguia conferir se a ficha técnica estava correta
sem abrir a tela de produtos e fazer a conta de cabeça.

O custo por insumo já existe no motor (`calculateLineCostCents`): quantidade
usada × custo por unidade do insumo. Faltava (a) expor esse detalhamento e
(b) uma forma de consultá-lo na home.

## Correção

| Camada | Arquivo |
|--------|---------|
| Motor | `src/services/calculations/productCostDetail.ts` — `buildProductCostDetail` (+ testes) |
| Motor | `src/services/calculations/productCostResolver.ts` — linhas de composição passam a trazer `targetType` e `targetId` |
| Motor | `src/services/calculations/units.ts` — `roundQuantity` exportado |
| Serviço | `src/services/supabase/pricing.ts` — `getProductCostBreakdown` devolve `detail`, sem consulta extra |
| Interface | `src/components/ui/Modal/Modal.tsx` + CSS — primeiro diálogo genérico do projeto |
| Interface | `src/features/pricing/ProductCostModal.tsx` + CSS — popup do custo do produto |
| Interface | `src/features/pricing/PricingMatrix.tsx` + CSS — nome do produto vira botão que abre o popup |
| Página | `src/app/(dashboard)/home/page.tsx` — passa o detalhamento de cada produto |

## Regras de exibição

- **Insumo em caixa ou pacote com equivalência** (`units_per_package`): a
  quantidade aparece em peças, que é como o responsável pensa. Exemplo: insumo
  com 2 peças por R$ 10,00, uso de 1 peça → "1 Unidade" e R$ 5,00 (0,5 caixa ×
  R$ 10,00).
- **Insumo sem equivalência**: a quantidade aparece na unidade base em que o
  custo foi registrado (kg, L, metro, unidade).
- O custo da linha é sempre `quantidade na unidade base × custo por unidade` —
  o valor já vem dividido pelo que foi usado.
- Além dos insumos, o popup mostra as demais linhas do custo de fabricação:
  perda de produção, mão de obra, energia, máquina, acabamento e despesas
  rateadas. A soma das linhas é igual ao "Custo de fabricação" da matriz.
- Insumo sem custo cadastrado aparece com "sem custo" e o popup avisa o que
  falta; o total fica indisponível.

## Acessibilidade do diálogo

- `role="dialog"`, `aria-modal="true"` e `aria-labelledby` com o título.
- Fecha pela tecla `Escape`, pelo clique na sobreposição e pelo botão de fechar.
- O foco entra no painel ao abrir e volta ao elemento de origem ao fechar.
- A rolagem do body fica travada enquanto o popup está aberto.

## Validação

- `npm run typecheck`, `npm run lint`, `npm test` (335 testes, 44 suítes) e
  `./pre-push.sh` verdes.
- Build de produção gerado sem erros.
- Teste real no servidor com sessão de administrador: insumo em caixa com 2
  peças por R$ 10,00 e produto que usa 1 peça. O payload da home traz
  `quantity: 1`, `unit: "unidade"` e `costCents: 500` para a linha do insumo —
  "1 vela, R$ 5,00" — e o total do produto (R$ 8,80) confere com a soma das
  linhas (material R$ 5,00 + mão de obra R$ 3,80). Temporários removidos.

## Pendência observada

`getProductCostBreakdown` recarrega catálogo, insumos, empresa, salários e
despesas a cada produto chamado. A home chama uma vez por produto, então o
custo da página cresce com o número de produtos. Não foi alterado nesta
tarefa (fora do escopo pedido); merece uma tarefa própria.
