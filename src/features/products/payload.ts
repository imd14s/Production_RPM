import type { ProductInput } from "@/features/products/types";

/**
 * Monta os parâmetros do RPC transacional de produtos e composições.
 *
 * @param productId identificador do produto em edição, ou null para criar
 * @param input dados validados do formulário
 * @returns parâmetros em formato JSON compatível com o banco
 */
export function buildProductPayload(
  productId: string | null,
  input: ProductInput,
): Record<string, unknown> {
  return {
    p_product_id: productId,
    p_name: input.name,
    p_kind: input.kind,
    p_labor_minutes: input.laborMinutes,
    p_energy_cost_cents: input.energyCostCents,
    p_machine_cost_cents: input.machineCostCents,
    p_finishing_cost_cents: input.finishingCostCents,
    p_failure_rate_percent: input.failureRatePercent,
    p_notes: input.notes || null,
    p_components: input.components.map((component) => ({
      supplyId: component.targetType === "supply" ? component.supplyId : null,
      productId: component.targetType === "product" ? component.productId : null,
      quantity: component.quantity,
    })),
  };
}
