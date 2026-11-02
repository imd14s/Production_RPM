import type { ProductionBatch, ProductionConsumption, InventoryMovement } from "./types";

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function parseProductionBatchRow(row: unknown): ProductionBatch | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const c = row as Record<string, unknown>;
  const id = c.id;
  const productId = c.product_id;
  const quantityProduced = readNumber(c.quantity_produced);
  const laborMinutesActual = readNumber(c.labor_minutes_actual);
  const energyCostCents = readNumber(c.energy_cost_cents);
  const machineCostCents = readNumber(c.machine_cost_cents);
  const finishingCostCents = readNumber(c.finishing_cost_cents);
  const isActive = c.isActive ?? c.is_active;

  if (typeof id !== "string" || typeof productId !== "string") {
    return null;
  }
  if (quantityProduced === null || quantityProduced <= 0) {
    return null;
  }
  if (laborMinutesActual === null || energyCostCents === null || machineCostCents === null || finishingCostCents === null) {
    return null;
  }
  if (typeof isActive !== "boolean") {
    return null;
  }

  return {
    id,
    productId,
    quantityProduced,
    producedAt: readString(c.produced_at),
    laborMinutesActual,
    energyCostCents,
    machineCostCents,
    finishingCostCents,
    notes: readString(c.notes),
    isActive,
  };
}

export function parseProductionConsumptionRow(row: unknown): ProductionConsumption | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const c = row as Record<string, unknown>;
  const id = c.id;
  const batchId = c.batch_id;
  const supplyId = c.supply_id;
  const quantityUsed = readNumber(c.quantity_used);
  const unitCostCents = readNumber(c.unit_cost_cents);

  if (typeof id !== "string" || typeof batchId !== "string" || typeof supplyId !== "string") {
    return null;
  }
  if (quantityUsed === null || quantityUsed <= 0 || unitCostCents === null) {
    return null;
  }
  if (!Number.isInteger(unitCostCents)) {
    return null;
  }

  return { id, batchId, supplyId, quantityUsed, unitCostCents };
}

export function parseInventoryMovementRow(row: unknown): InventoryMovement | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }
  const c = row as Record<string, unknown>;
  const id = c.id;
  const itemType = c.item_type;
  const itemId = c.item_id;
  const movementType = c.movement_type;
  const quantity = readNumber(c.quantity);
  const unitCostCents = readNumber(c.unit_cost_cents);
  const referenceType = c.reference_type;
  const referenceId = c.reference_id;

  if (typeof id !== "string" || typeof itemId !== "string") {
    return null;
  }
  if (itemType !== "supply" && itemType !== "product") {
    return null;
  }
  if (movementType !== "entrada" && movementType !== "saida" && movementType !== "consumo" && movementType !== "perda" && movementType !== "ajuste") {
    return null;
  }
  if (quantity === null || unitCostCents === null) {
    return null;
  }
  if (!Number.isInteger(unitCostCents)) {
    return null;
  }

  return {
    id,
    itemType,
    itemId,
    movementType,
    quantity,
    unitCostCents,
    referenceType: typeof referenceType === "string" ? referenceType : null,
    referenceId: typeof referenceId === "string" ? referenceId : null,
    notes: readString(c.notes),
    createdAt: readString(c.created_at),
  };
}