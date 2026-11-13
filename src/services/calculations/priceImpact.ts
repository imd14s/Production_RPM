/**
 * Análise automática de impacto de mudança de custo de insumo.
 *
 * Compara o custo atual do produto com o último snapshot salvo. Se houver
 * diferença, o produto é marcado para revisão de preço.
 */

export type PriceImpactResult = {
  hasBaseline: boolean;
  costDeltaCents: number;
  costDeltaPercent: number | null;
  impacted: boolean;
};

/**
 * Compara o custo atual com o último snapshot.
 *
 * @param currentCostCents custo atual do produto em centavos
 * @param baselineCostCents custo do último snapshot, ou null quando não existe
 * @returns análise de impacto
 */
export function analyzePriceImpact(
  currentCostCents: number | null,
  baselineCostCents: number | null,
): PriceImpactResult {
  if (currentCostCents === null || baselineCostCents === null) {
    return {
      hasBaseline: baselineCostCents !== null,
      costDeltaCents: 0,
      costDeltaPercent: null,
      impacted: false,
    };
  }

  const costDeltaCents = currentCostCents - baselineCostCents;

  const costDeltaPercent =
    baselineCostCents > 0
      ? (costDeltaCents / baselineCostCents) * 100
      : null;

  return {
    hasBaseline: true,
    costDeltaCents,
    costDeltaPercent,
    impacted: costDeltaCents !== 0,
  };
}