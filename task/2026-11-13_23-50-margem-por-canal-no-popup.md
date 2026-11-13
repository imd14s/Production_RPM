# Task — Margem de lucro por canal no popup do produto

**Data:** 2026-11-13
**Status:** Concluída
**Origem:** relato do responsável — o popup do produto (task
`2026-11-13_23-15-popup-custo-produto-home.md`) precisava mostrar também a
sugestão de preço e permitir alterar a margem de lucro de cada canal de venda.
A linha inteira do produto na tabela da home também passou a ser clicável.

## Contexto

A home já mostrava o preço sugerido por canal, mas a margem usada vinha de uma
simulação antiga ou da margem padrão da empresa — sem caminho para ajustá-la
sem sair da home. A margem registrada é o que a matriz usa: `latestRetailSimulation`
busca a última simulação de **varejo** do produto no canal.

Decisão: **reaproveitar o mecanismo existente** (`pricing_simulations`), sem
tabela nova. Salvar a margem grava uma nova simulação do canal, exatamente
como a tela `/precificacao` faz.

## Correção

| Camada | Arquivo |
|--------|---------|
| Motor | `src/services/calculations/pricingMatrix.ts` — `previewChannelPriceCents` (preço + resumo das taxas), usada pela matriz e pelo popup; `toFee` exportado |
| Motor | `src/services/calculations/pricingMatrix.test.ts` — casos da prévia de preço |
| Ação | `src/app/actions/pricing.ts` — `saveProductChannelMarginAction` (produto, canal, margem) |
| Interface | `src/features/pricing/ChannelMarginEditor.tsx` + CSS — campo de margem com prévia ao vivo |
| Interface | `src/features/pricing/ProductCostModal.tsx` + CSS — seção "Sugestão de preço por canal" |
| Interface | `src/features/pricing/PricingMatrix.tsx` + CSS — linha inteira clicável |
| Página | `src/app/(dashboard)/home/page.tsx` — canais e impostos repassados ao popup |

## Comportamento

- O popup mostra, por canal, a **margem em uso**, o **preço sugerido** e as
  **taxas aplicadas** (comissões do canal + impostos ativos, e taxas fixas).
- O campo de margem recalcula o preço **enquanto o responsável digita**, com o
  mesmo motor da matriz (`previewChannelPriceCents`).
- "Salvar" grava uma nova simulação de preço (varejo) do canal, com o custo
  congelado em snapshot — o mesmo caminho de `/precificacao`. A home passa a
  usar a margem salva e a etiqueta "Revisar preço" é reavaliada.
- Margem fora de 0% a 100% é recusada com mensagem de negócio.
- O **atacado (venda direta)** aparece no popup apenas para consulta: a margem
  do atacado vem das configurações da empresa e a tabela de simulações exige um
  canal cadastrado (`channel_id` é obrigatório).
- Insumo sem custo continua bloqueando o preço (custo incompleto).

## Linha inteira clicável

- O `<tr>` da matriz recebe o clique e abre o popup do produto.
- O nome do produto continua sendo um `<button>`, para navegação por teclado.
- A linha ganha cursor de ponteiro e realce ao passar o mouse.

## Validação

- `npm run typecheck`, `npm run lint`, `npm test` (339 testes, 44 suítes) e
  `./pre-push.sh` verdes; build de produção sem erros.
- Teste real no servidor com sessão de administrador: produto com custo de
  R$ 20,00 no canal "Loja física". Margem inicial 30% na matriz; após salvar
  45%, a simulação foi gravada (`margin_percent = 0,45`, `price_cents = 5000`,
  modalidade `varejo`) e a home passou a exibir a margem 0,45 e o preço 5000 —
  o mesmo valor devolvido pela Server Action. Margem de 150% foi recusada com
  "Informe uma margem de lucro entre 0 e 100%.".
- Temporários removidos ao final do teste.
