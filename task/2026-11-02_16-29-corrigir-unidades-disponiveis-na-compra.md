# Corrigir unidades disponíveis na compra de insumos

**Data de criação:** 2026-11-02 16:29
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e validada

## Problema

O seletor de unidade de compra mostra unidades incompatíveis com a unidade base
do insumo. Por exemplo, permite selecionar litro para um insumo medido em grama,
mas não há conversão universal entre volume e massa sem densidade.

## Correção

1. Filtrar as opções do seletor para unidade base + equivalência métrica do mesmo
   tipo: grama/quilograma ou mililitro/litro.
2. Preservar a validação de servidor para impedir snapshots inválidos se o cliente
   enviar manualmente uma combinação incompatível.
3. Testar opções compatíveis, payload, parsing de valores numéricos do banco e
   formatação pt-BR do histórico, sem mocks.
4. Confirmar o fluxo Supabase na migration, serviço de gravação e serviço de leitura.
   Não há credencial de consulta ao banco remoto disponível nesta sessão; validar o
   contrato local por schema, payload e parser sem afirmar uma consulta remota.

## Critérios de aceitação

- Um insumo em gramas não oferece litro no seletor; oferece grama e quilograma.
- O payload persiste `quantity` original e `purchase_unit`, e calcula o custo na
  unidade base.
- O parser aceita os tipos numéricos retornados pelo PostgreSQL e o histórico
  exibe quantidade e unidade em pt-BR.
- Typecheck, lint e `./pre-push.sh` passam.

## Validação

- `./pre-push.sh`: typecheck e lint aprovados; 38 suítes e 273 testes passaram.
- A gravação persiste `quantity` e `purchase_unit` no payload, e calcula
  `unit_cost_cents` na unidade base; a leitura usa `select("*")`, parser de
  `supply_prices` e formatação pt-BR do histórico.
- A tentativa reportada falhou durante a conversão, antes da operação de insert;
  não houve gravação dessa compra. Não foi feita consulta ao banco remoto nesta sessão.
