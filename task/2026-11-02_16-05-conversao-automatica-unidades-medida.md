# Conversão automática de unidades na compra de insumos

**Data de criação:** 2026-11-02 16:05
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e validada

## Objetivo

Remover o cadastro manual redundante de conversões da tela do insumo e converter
automaticamente unidades métricas compatíveis durante o cálculo do custo de compra.

## Escopo técnico

1. Retirar a seção e os formulários de conversão da página de detalhe do insumo.
2. Converter automaticamente grama/quilograma e mililitro/litro, em ambas as
   direções, antes de calcular o custo por unidade base.
3. Para unidades sem equivalência universal (unidade, metro, pacote, caixa e
   outro), aceitar apenas a mesma unidade base; rejeitar combinações diferentes
   com mensagem explícita.
4. Remover da aplicação as ações e operações de cadastro manual que ficaram sem
   interface; preservar a migration existente, sem alterá-la.
5. Atualizar os testes unitários, a spec, a memória, o índice e tasks relacionadas.
6. Executar `./pre-push.sh` e criar commit atômico na branch `dev`.

## Critérios de aceitação

- Não há seção ou formulário de cadastro manual de conversão no detalhe do insumo.
- Quilograma e grama, litro e mililitro convertem automaticamente.
- Unidade incompatível não gera snapshot de custo incorreto.
- Typecheck, lint e testes passam.

## Validação

- `./pre-push.sh`: typecheck e lint aprovados; 38 suítes e 271 testes aprovados.
- Migration histórica mantida sem alterações.
