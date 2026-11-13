# Remover unidade da compra e histórico de aquisições

**Data de criação:** 2026-11-02 19:30
**Agente:** Copilot SDK in VS Code
**Status:** Em execução — escopo aprovado pelo usuário

## Pedido

Manter `supplies.unit` (unidade base) e remover o campo redundante “Unidade da compra”,
assim como `supply_prices.purchase_unit`, dos formulários e da tabela.

## Levantamento

O usuário esclareceu que `supplies.unit` deve permanecer e que o campo/coluna próprios de
`purchase_unit` devem ser removidos. Hoje `purchase_unit` também alimenta formulários de
compras posteriores, exibição histórica, conversão de custo, parser e RPC de cadastro.
A coluna é distinta da unidade base e foi adicionada por migration aplicada ao Supabase.

O usuário confirmou que não precisa do histórico de aquisições e autorizou manter
somente os dados atuais usados no cálculo de custo e na sugestão de preço. Também
autorizou atualizar `task.md` e as specs, que antes exigiam histórico de preços.

Remover a tabela exige migration nova. A aquisição mais recente será migrada para
`supplies` somente quando sua unidade corresponder à unidade base ou houver equivalência
métrica conhecida. Custos sem conversão válida ficarão sem dados atuais para novo
preenchimento.

## Plano proposto após esclarecimento

1. Manter apenas `supplies.unit` como unidade do insumo e remover todos os seletores,
   tipos, payloads, parsing e exibição de `purchase_unit`.
2. Deixar de manter histórico de aquisições: substituir os registros em `supply_prices`
   por dados atuais de custo vinculados ao insumo (quantidade sempre na unidade base,
   valor pago, frete e custo unitário calculado).
3. Atualizar o formulário único para criar/editar os dados atuais sem seção ou tela de
   histórico; remover a rota/ações/serviços dedicados a histórico de compras.
4. Criar migration nova (não alterar migrations aplicadas) para levar somente o custo
   mais recente compatível de cada insumo ao modelo atual e remover `supply_prices` e a
   RPC de cadastro inicial.
5. Se o custo atual tiver unidade comprada não conversível à unidade base, não inventar
   conversão: deixar esse custo sem valor para novo preenchimento depois da migration.
6. Atualizar spec, memória e testes unitários sem mocks; preservar alterações locais
   anteriores em `units.test.ts` e `supabase/.temp/`.

## Validação

O usuário aprovou a remoção do histórico e a atualização da fonte de verdade em
`task.md`. A implementação e a validação automatizada estão em andamento; a migration
deverá ser aplicada ao Supabase antes de utilizar o novo modelo no ambiente remoto.
