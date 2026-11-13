# Spec 100 — Relatórios e indicadores (Etapa 8)

**Status:** Implementada no código
**Fonte de verdade:** `task.md`, seção "Relatórios"

## Objetivo

Apresentar indicadores de rentabilidade, custos por categoria, comparação
entre canais e evolução de preços de insumos, a partir dos dados já
cadastrados.

> **Obs. (2026-11-03):** com a matriz de preços por plataforma na **home**
> (spec 070), a comparação de canais principal é de leitura rápida e não
> substitui a comparação em `/relatorios`. A evolução de preços de insumos
> tem base nos snapshots (não há histórico de aquisições).

## Sub-etapas

| Sub-etapa | Entrega | Rota |
|---|---|---|
| 8.1 | Produtos mais rentáveis | `/relatorios` |
| 8.2 | Produtos com menor margem | `/relatorios` |
| 8.3 | Custos por categoria | `/relatorios` |
| 8.4 | Comparação entre canais | `/relatorios` |
| 8.5 | Evolução de preços de insumos | `/relatorios` |
| 8.6 | Rentabilidade estimada | `/relatorios` |

## Regras

- Somente leitura; sem exportação de dados.
- Cálculos reutilizam o motor de precificação.
- RLS respeitada.

## Pendências de modelagem

- Definir quais indicadores são calculados no servidor vs. no cliente.
- Confirmar se relatórios são persistidos ou calculados on demand.