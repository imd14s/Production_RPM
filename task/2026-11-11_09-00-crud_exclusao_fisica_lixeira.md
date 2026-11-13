# Task — CRUD completo com exclusão física (lixeira)

**Data:** 2026-11-11
**Status:** Implementada e validada — migration aplicada no Supabase (2026-11-13)
**Pedido do responsável:** adicionar lixeira para excluir registros e garantir CRUD completo (adição, edição, remoção) em todo tipo de cadastro configurável.

## Contexto

Até agora o sistema usava apenas **exclusão lógica** (`is_active`) — decisão antiga documentada nas specs. O pedido atual é de **exclusão física** com confirmação, para taxas, canais, meios de pagamento, impostos, despesas, mão de obra, fornecedores, insumos e produtos.

## Decisões

1. **Exclusão física liberada** para registros de configuração/cadastro sem histórico financeiro direto; `company_settings` permanece sem DELETE (linha única).
2. **FKs RESTRICT permanecem**: se o registro estiver em uso (simulações, snapshots, composições, insumos de fornecedor), o banco bloqueia e a app mostra mensagem amigável (código `23503`).
3. **Cascades** (taxas filhas, ficha técnica, conversões) exigem policy de `DELETE` nas tabelas filhas — migration nova.
4. **Confirmação** via `window.confirm` no botão de lixeira; erros exibidos na própria linha (`Alert`).
5. Toggle lógico (Ativar/Desativar) continua disponível; exclusão é ação adicional.

## Escopo técnico

| Camada | Arquivos |
|---|---|
| Migration | `supabase/migrations/20261111090000_allow_admin_delete_domain_rows.sql` |
| UI | `DeleteRowButton` (+ variante `danger` em `Button`/`PendingButton`) |
| Services | `deleteX` em channels, payments, settings, costs, suppliers, supplies, products + `mapDeleteError` |
| Actions | `deleteXAction` com `getAdminSession`, `revalidatePath`, retorno `SettingsFormState` |
| Painéis | Channels, ChannelFees, Methods, Fees, Tax, Labor, Expenses, Suppliers, Supplies, Products |

## Validação

- `./pre-push.sh` (typecheck, lint, jest)
- Migração aplicada ao Supabase em 2026-11-13 (12 policies `*_delete_admin`
  verificadas em `pg_policies`) e validada com sessão real de administrador:
  DELETE existente → 1 linha removida; DELETE sem permissão → 0 linhas.
