# Corrigir leitura e exibição de percentuais numéricos

**Data de criação:** 2026-11-02 15:21
**Agente:** Copilot SDK in VS Code
**Status:** Concluída

## Objetivo

Corrigir os avisos incorretos de ausência de impostos e taxas quando o Supabase
retorna o campo `rate` como número. Garantir por testes unitários sem mocks que os
registros atravessam o parser e produzem o texto formatado que as tabelas exibem.

## Arquivos previstos

- `src/features/settings/parse.ts` e `parse.test.ts`
- `src/features/channels/parse.ts` e `parse.test.ts`
- `src/features/payments/parse.ts` e `parse.test.ts`
- `docs/spec/030-configuracoes.md`
- `docs/MEMORIA.md`

## Passos técnicos

1. Manter a consulta Supabase existente e confirmar o contrato de saída usado pelos
   parsers (`rate` numérico ou textual).
2. Normalizar percentuais numéricos e textuais para o formato canônico validado,
   rejeitando valores malformados em vez de descartá-los silenciosamente na tela.
3. Adicionar casos sem mocks que passam um registro do formato recebido do banco
   pelo parser e verificam o valor em pt-BR exibido pela mesma função de formatação
   usada nas células.
4. Executar testes focados, typecheck, lint e `./pre-push.sh`; documentar causa e
   correção e criar commit atômico na branch `dev`.

## Critérios de aceitação

- O imposto ICMS, as duas taxas do Mercado Livre e a taxa da Maquininha são
  preservados no caminho parser → painel, em vez de resultarem em listas vazias.
- Percentuais numéricos do banco são apresentados em pt-BR sem casas decimais
  desnecessárias; percentuais textuais existentes continuam compatíveis.
- Testes unitários verificam o formato do banco e o valor formatado exibido, sem
  mocks, DOM, integração ou alteração de configuração.
- Typecheck, lint, testes e `./pre-push.sh` passam.

## Validação executada

- Testes focados: 4 suítes, 36 testes.
- `./pre-push.sh`: typecheck e lint aprovados; 38 suítes e 273 testes unitários
  aprovados.
