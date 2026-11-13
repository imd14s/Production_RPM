# Salvar a unidade informada na compra

**Data de criação:** 2026-11-02 16:41
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e validada

## Objetivo

Simplificar o registro: o seletor contém kg, gm, L, unidade e outro; a compra salva a
quantidade e a unidade escolhidas sem bloquear por incompatibilidade com a unidade base.

## Escopo

1. Exibir as cinco unidades pedidas, preservando unidades antigas apenas ao editar uma
   compra histórica para não alterar seu registro sem escolha explícita.
2. Salvar quantidade, unidade, valor e frete informados; calcular custo por unidade
   comprada sem conversão obrigatória.
3. Só disponibilizar custo para precificação por unidade base quando uma conversão
   métrica conhecida for compatível. Não atribuir custo incorreto entre massa e volume.
4. Exibir no histórico o custo por unidade efetivamente comprada.
5. Testar opções, payload, parsing e formatação sem mocks; atualizar documentação.

## Critérios de aceitação

- Compra em litro pode ser salva para insumo cuja unidade base seja grama.
- O payload persiste quantidade e unidade informadas e calcula custo por unidade
  comprada.
- Compra incompatível não bloqueia o histórico nem fornece custo indevido ao motor de
  precificação.
- `./pre-push.sh` passa.

## Validação

- `./pre-push.sh`: typecheck e lint aprovados; 38 suítes e 274 testes passaram.
- A validação unitária não usa mocks; cobre opções e rótulos, payload, parsing,
  formatação e unidade incompatível salva.
- O contrato de gravação e leitura foi revisado no código. Não foi feita consulta ao
  banco remoto nesta sessão.
