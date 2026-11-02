import type {
  InventoryMovementInput,
  ProductionBatchInput,
  ProductionConsumptionInput,
} from "./types";

export function buildProductionBatchPayload(input: ProductionBatchInput): Record<string, unknown> {
  return {
    product_id: input.productId,
    quantity_produced: input.quantityProduced,
    produced_at: input.producedAt || null,
    labor_minutes_actual: input.laborMinutesActual,
    energy_cost_cents: input.energyCostCents,
    machine_cost_cents: input.machineCostCents,
    finishing_cost_cents: input.finishingCostCents,
    notes: input.notes || null,
  };
}

export function buildProductionConsumptionPayload(
  batchId: string,
  input: ProductionConsumptionInput,
): Record<string, unknown> {
  return {
    batch_id: batchId,
    supply_id: input.supplyId,
    quantity_used: input.quantityUsed,
    unit_cost_cents: input.unitCostCents,
  };
}

export function buildInventoryMovementPayload(input: InventoryMovementInput): Record<string, unknown> {
  return {
    item_type: input.itemType,
    item_id: input.itemId,
    movement_type: input.movementType,
    quantity: input.quantity,
    unit_cost_cents: input.unitCostCents,
    reference_type: input.referenceType,
    reference_id: input.referenceId,
    notes: input.notes || null,
  };
}