# Spec 110 — Publicação (Etapa 9)

**Status:** Planejada (aguardando aprovação)
**Fonte de verdade:** `task.md`, seção "Publicação"

## Objetivo

Configurar a publicação na Vercel, variáveis de produção, domínio privado,
backups e monitoramento dos limites gratuitos.

## Sub-etapas

| Sub-etapa | Entrega |
|---|---|
| 9.1 | Configurar projeto na Vercel |
| 9.2 | Variáveis de ambiente de produção |
| 9.3 | Domínio privado |
| 9.4 | Backups do Supabase |
| 9.5 | Monitoramento dos limites gratuitos |
| 9.6 | Validação final (build, testes, smoke) |

## Regras

- Nunca expor chaves secretas no navegador.
- `main` permanece protegida; merge exige autorização.
- RLS ativa em produção.

## Pendências

- Definir domínio.
- Confirmar estratégia de backup.