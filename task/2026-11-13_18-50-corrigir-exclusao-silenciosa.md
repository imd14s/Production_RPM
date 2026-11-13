# Task — Correção da exclusão silenciosa (lixeira que não exclui)

**Data:** 2026-11-13
**Status:** Concluída
**Origem:** relato do responsável — "o botão excluir não está excluindo e não está apresentando erro".

## Contexto

A feature de exclusão física (task `2026-11-11_09-00-crud_exclusao_fisica_lixeira.md`)
foi implementada e validada localmente, mas a migration que cria as policies de
DELETE ficou pendente no Supabase. O sintoma era: clique em "Excluir", confirmação,
a linha continua na lista e **nenhum erro aparece**.

## Diagnóstico

1. **Causa raiz (banco):** `20261111090000_allow_admin_delete_domain_rows.sql` não
   estava aplicada. Sem policy `for delete`, o RLS filtra a linha e o PostgREST
   devolve **HTTP 200 com `error: null` e zero linhas** — falha silenciosa.
   Verificado em `pg_policies`: existia apenas `product_components_delete_admin`.
2. **Amplificador (aplicação):** os 10 services faziam `delete().eq("id", id)` sem
   `.select()`, portanto não tinham como transformar "0 linhas" em erro.
3. **Amplificador (interface):** `DeleteRowButton` só renderizava `Alert` para
   `status === "error"`; o estado de sucesso era descartado.
4. **Risco (interface):** nenhum fluxo de exclusão chamava `router.refresh()`;
   `revalidatePath` sozinho já mostrou problema antes neste projeto
   (`MEMORIA.md`, commit `536ee03`).

## Correção

| Camada | Alteração |
|--------|-----------|
| Banco | Migration `20261111090000_allow_admin_delete_domain_rows.sql` aplicada no Supabase (12 policies `*_delete_admin` + `grant delete`) |
| Services | `deleteX` nos 7 arquivos passam a usar `.delete().eq(...).select("id")` e chamam `assertRowDeleted` — 0 linhas vira erro explícito |
| Erros | `mapDeleteError` com rótulo completo ("o produto", "a despesa fixa") para mensagens em pt-BR corretas |
| Interface | `DeleteRowButton` exibe estado de **sucesso** e chama `router.refresh()` após excluir |
| Testes | `src/services/supabase/deleteErrors.test.ts` (tradução de erros + contrato de "0 linhas") |

## Escopo dos botões de exclusão (10)

Produtos, insumos, fornecedores, impostos, canais, taxas de canal, meios de
pagamento, taxas de meio, despesas fixas e mão de obra.

## Validação

- `npm run typecheck`, `npm run lint`, `npm test` (296 testes) e `./pre-push.sh` verdes.
- Banco: sessão real de administrador via API de autenticação — DELETE existente
  remove 1 linha; DELETE sem permissão remove 0; DELETE de id inexistente devolve
  HTTP 200 com `[]` (caso agora convertido em erro pela aplicação).

## Pendência

- Nenhuma. A exclusão depende de o usuário estar com perfil **administrador**
  ativo no Supabase.
