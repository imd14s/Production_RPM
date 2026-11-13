# Unificar cadastro do insumo e primeira compra

**Data de criação:** 2026-11-02 19:05
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e validada; migration remota pendente

## Objetivo

Na inclusão de um novo insumo, apresentar um único formulário com os dados do insumo
e da primeira compra. Um único envio deve salvar ambos, sem deixar cadastro incompleto
caso uma das gravações falhe.

## Escopo proposto

1. Integrar no formulário de novo insumo categoria, unidade base, unidade comprada,
   quantidade, valor, frete opcional, data e demais campos atuais.
2. Preservar a edição de insumos sem exigir uma nova compra.
3. Preservar o formulário simples de novas compras na página de detalhe do insumo.
4. Gravar insumo e primeira compra atomicamente, respeitando autenticação, autorização
   administrativa e RLS; adicionar migration/RPC somente se necessário para a operação
   transacional.
5. Atualizar spec e memória; incluir testes unitários de validação/payload sem mocks.

## Critérios de aceitação

- Na inclusão, a tela apresenta um único `<form>` para insumo e primeira compra.
- A submissão cria o insumo e sua compra inicial em uma única operação transacional.
- Se a validação ou gravação falhar, não fica um insumo criado sem sua compra inicial.
- Edição de insumos existentes e compras posteriores continuam funcionando.
- Typecheck, lint, testes e `./pre-push.sh` passam.

## Observação de estado

Ao iniciar, já havia alterações locais não commitadas em `AcquisitionsPanel.tsx`,
`units.test.ts` e novos arquivos `SimpleAcquisitionForm.tsx` e CSS. Devem ser
preservadas e integradas, sem descarte ou sobrescrita.

## Validação

- `./pre-push.sh`: typecheck e lint passaram sem avisos; 38 suítes e 279 testes passaram.
- Testes unitários sem mocks cobrem validação combinada e os argumentos/custo do payload
  transacional.
- A aplicação da migration no Supabase remoto ainda está pendente.
