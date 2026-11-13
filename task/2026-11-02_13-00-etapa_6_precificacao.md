# Etapa 6 — Motor de precificação

**Data de Criação:** 2026-11-02 13:00
**Agente:** OpenCode — Beam Free
**Status:** ✅ Implementada no código; migrations aplicadas no Supabase
**Etapa:** 6 de 9 (ver `task.md`)

## Objetivo

Implementar o motor financeiro que calcula custo completo e preço recomendado
por canal e modalidade, consumindo os cadastros da Etapa 5 e os parâmetros da
Etapa 4. O motor é puro, testável e independente da interface.

## Sub-etapas propostas

1. 6.1 Motor base: função `calculatePrice` com validação de denominador.
2. 6.2 Taxas: aplicação de percentuais e valores fixos de canal/pagamento.
3. 6.3 Impostos: aplicação configurável dos impostos ativos.
4. 6.4 Rateio: despesas operacionais e mão de obra por unidade.
5. 6.5 Custo por modalidade: fabricado, revenda, impressão 3D, kit (com conversões).
6. 6.6 Precificação por canal/modalidade: varejo e atacado.
7. 6.7 Simulações e comparação de canais (tabela a definir).
8. 6.8 UI `/precificacao` e snapshots.

## Áreas afetadas

- `src/services/calculations/`
- `src/lib/validations/` (validações de simulação)
- `src/features/pricing/`
- `src/app/(dashboard)/precificacao/`
- `src/app/actions/pricing.ts`
- `supabase/migrations/` (pricing_simulations, cost_snapshots — a modelar)
- `docs/spec/070-precificacao.md`

## Critérios de aceite (Etapa 6)

- Motor puro com testes cobrindo todos os casos listados em `task.md`.
- Denominador inválido retorna erro explícito, nunca NaN/Infinity.
- Preço por canal e modalidade.
- Snapshots imutáveis.
- Typecheck, lint, testes e `./pre-push.sh` verdes.

## Pendências de modelagem

- Confirmar estrutura de `pricing_simulations` e `cost_snapshots`.
- Confirmar regra de atacado (desconto ou margem distinta).
- Confirmar se simulações são persistidas ou apenas calculadas.