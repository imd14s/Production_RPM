import type { CostSnapshotInput, PricingSimulationInput } from "./types";

export function buildCostSnapshotPayload(input: CostSnapshotInput): Record<string, unknown> {
  return {
    product_id: input.productId,
    cost_cents: input.costCents,
    material_cents: input.materialCents,
    labor_cents: input.laborCents,
    overhead_cents: input.overheadCents,
    components: input.components,
  };
}

export function buildPricingSimulationPayload(input: PricingSimulationInput): Record<string, unknown> {
  return {
    product_id: input.productId,
    cost_snapshot_id: input.costSnapshotId,
    channel_id: input.channelId,
    payment_method_id: input.paymentMethodId,
    modality: input.modality,
    margin_percent: input.marginPercent,
    variable_percent: input.variablePercent,
    fixed_fees_cents: input.fixedFeesCents,
    price_cents: input.priceCents,
  };
}