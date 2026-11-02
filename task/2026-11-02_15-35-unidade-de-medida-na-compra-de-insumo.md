# Unidade de medida por aquisição de insumo

**Data de criação:** 2026-11-02 15:35
**Agente:** Copilot SDK in VS Code
**Status:** Implementada e commitada; migration aguarda aplicação manual

## Objetivo

Permitir registrar a quantidade da compra junto com sua unidade de medida, convertendo
para a unidade base do insumo antes de calcular o custo por unidade e mantendo a unidade
original no histórico.

## Arquivos previstos

- Nova migration `supabase/migrations/*_add_purchase_unit.sql`
- `src/features/supplies/AcquisitionForm.tsx` e CSS correspondente
- `src/features/supplies/AcquisitionsPanel.tsx`
- `src/features/supplies/types.ts`, `parse.ts`, `parse.test.ts`
- `src/features/supplies/payload.ts`, `format.ts` e `parse.test.ts`
- `src/lib/validations/supplies.ts` e `supplies.test.ts`
- `src/services/supabase/supplies.ts`
- `src/app/(dashboard)/insumos/[id]/page.tsx`
- `src/features/supplies/AcquisitionsPanel.module.css`
- `docs/spec/040-cadastros.md`, `docs/MEMORIA.md`, `docs/MASTER_INDEX.md`
- `supabase/README.md`

## Passos técnicos

1. Adicionar `purchase_unit` à tabela `supply_prices` em migration nova e preencher
   registros antigos com `supplies.unit`, sem alterar migrations existentes.
2. Incluir um seletor de unidade ao lado da quantidade comprada, usando as unidades
   já suportadas e selecionando por padrão a unidade base do insumo.
3. Persistir a unidade informada em cada compra e exibi-la por compra no histórico.
4. Calcular o custo por unidade base: usar quantidade diretamente se as unidades
   coincidirem; caso contrário, converter pela conversão ativa cadastrada para o
   insumo    (direta ou inversa). Se houver fatores nas duas direções, aceitar apenas
   quando forem consistentes. Sem conversão válida, impedir o salvamento e
   apontar como cadastrar a conversão, em vez de gravar custo incorreto.
5. Incluir testes unitários sem mocks para validação, conversão, snapshot de custo,
   payload, leitura dos registros antigos e rótulo exibido no histórico.
6. Atualizar documentação, executar typecheck, lint, testes e `./pre-push.sh`; revisar
   e criar commit atômico na branch `dev`.

## Critérios de aceitação

- O formulário solicita quantidade e unidade de compra em campos claros.
- Compras em unidade diferente da unidade base usam fator ativo e salvam custo
  calculado corretamente na unidade base.
- Uma conversão ausente ou ambígua bloqueia a gravação com erro explícito.
- O histórico identifica a quantidade e unidade originais de cada compra.
- Compras anteriores continuam válidas e recebem a unidade base do insumo no backfill.
- Testes unitários verificam os cálculos e os valores apresentados, sem mocks.
- Typecheck, lint, testes e `./pre-push.sh` passam.

## Execução

- Implementados o campo `purchase_unit`, a seleção da unidade no formulário, a
  conversão validada no servidor e a apresentação da unidade original no histórico.
- Migration criada, mas ainda não aplicada ao Supabase.
- Validação final: `npm run typecheck`, `npm run lint` e `./pre-push.sh` aprovados;
  38 suítes e 282 testes passaram.
- A migration ainda precisa ser aplicada no Supabase pelo responsável do projeto.
- Commit de implementação: `dd22080` (`track purchase units for supply acquisitions`).
