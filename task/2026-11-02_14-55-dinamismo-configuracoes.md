# Dinamismo das listas de configurações

**Data de criação:** 2026-11-02 14:55
**Agente:** Copilot SDK in VS Code
**Status:** Concluída

## Objetivo

Revisar as abas Empresa, Impostos, Canais, Pagamentos, Despesas e Mão de obra,
incluindo as listas de taxas dos canais e meios de pagamento, para que os dados
salvos ou ativados/desativados apareçam imediatamente na tela.

## Arquivos previstos

- `src/features/settings/CompanyForm.tsx`
- `src/features/settings/TaxSettingsPanel.tsx`
- `src/features/channels/ChannelsPanel.tsx`
- `src/features/channels/ChannelFeesPanel.tsx`
- `src/features/payments/MethodsPanel.tsx`
- `src/features/payments/FeesPanel.tsx`
- `src/features/costs/ExpensesPanel.tsx`
- `src/features/costs/LaborPanel.tsx`
- `docs/spec/030-configuracoes.md`
- `docs/MEMORIA.md`

## Passos técnicos

1. Conferir os fluxos de leitura, salvamento e ativação em todas as telas de
   configurações.
2. Preservar e integrar as alterações locais já existentes nos painéis de impostos,
   canais e pagamentos; corrigir handlers definidos mas não conectados e cobrir os
   painéis de despesas e mão de obra.
3. Atualizar a visualização após salvamento ou ativação/desativação, sem remover o
   feedback existente nem alterar regras de negócio.
4. Registrar o comportamento e a causa na spec e na memória do projeto.
5. Executar typecheck, lint, testes unitários e `./pre-push.sh`; revisar o diff e
   criar um commit atômico na branch `dev`.

## Critérios de aceitação

- Um novo imposto, canal, meio de pagamento, taxa, despesa ou custo de mão de obra
  aparece na lista após o salvamento bem-sucedido sem recarregar manualmente a página.
- Edições e ativações/desativações refletem os dados atualizados na lista e nos
  indicadores de taxas ativas.
- A tela de empresa mantém o estado salvo coerente após sucesso.
- Erros de validação/gravação não acionam atualização como se fossem sucesso.
- Typecheck, lint, testes e `./pre-push.sh` passam sem erros ou avisos.
