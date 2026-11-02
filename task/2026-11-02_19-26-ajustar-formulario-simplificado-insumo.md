# Ajustar formulário simplificado de insumo

**Data de criação:** 2026-11-02 19:26
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e validada

## Pedido

Reordenar os campos para deixar Observação por último e retirar a indicação visual
de “primeira compra” do formulário simplificado de novo insumo.

## Decisão confirmada

Os campos de quantidade, unidade de compra, valor, frete e data permanecem no formulário.
Remover somente a separação visual e os textos “primeira compra”; todo o cadastro é um
único formulário de novo insumo e continua sendo persistido atomicamente.

## Escopo após confirmação

- Mover Observação para a posição final do formulário.
- Ajustar o título e os textos de ação para “Novo insumo” e “Cadastrar insumo”.
- Manter os campos de compra integrados ao formulário sem grupo visual separado.
- Atualizar a spec e a memória para refletir o formulário único e sem divisão visual.
- `./pre-push.sh`: typecheck e lint aprovados sem avisos; 38 suítes e 279 testes passaram.
