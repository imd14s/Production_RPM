/**
 * Tipos de produção e estoque.
 */

export type ProductionBatch = {
  id: string;
  productId: string;
  quantityProduced: number;
  producedAt: string;
  laborMinutesActual: number;
  energyCostCents: number;
  machineCostCents: number;
  finishingCostCents: number;
  notes: string;
  isActive: boolean;
};

export type ProductionBatchInput = {
  productId: string;
  quantityProduced: number;
  producedAt: string;
  laborMinutesActual: number;
  energyCostCents: number;
  machineCostCents: number;
  finishingCostCents: number;
  notes: string;
};

export type ProductionConsumption = {
  id: string;
  batchId: string;
  supplyId: string;
  quantityUsed: number;
  unitCostCents: number;
};

export type ProductionConsumptionInput = {
  supplyId: string;
  quantityUsed: number;
  unitCostCents: number;
};

export type InventoryMovementType = "entrada" | "saida" | "consumo" | "perda" | "ajuste";

export type InventoryMovement = {
  id: string;
  itemType: "supply" | "product";
  itemId: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCostCents: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string;
  createdAt: string;
};

export type InventoryMovementInput = {
  itemType: "supply" | "product";
  itemId: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCostCents: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string;
};