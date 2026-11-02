import { parseAmountToCents } from "@/lib/money";
import { parseQuantityInput } from "@/lib/quantity";
import { readText } from "@/lib/validations/settings";
import type {
  ProductionBatchInput,
  InventoryMovementInput,
  InventoryMovementType,
} from "@/features/production/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

export function validateProductionBatch(
  raw: Record<string, unknown>,
): ValidationResult<ProductionBatchInput> {
  const errors: Record<string, string> = {};
  const productId = readText(raw, "productId");
  const quantityText = readText(raw, "quantityProduced");
  const producedAt = readText(raw, "producedAt");
  const laborText = readText(raw, "laborMinutesActual");
  const energyCents = parseAmountToCents(readText(raw, "energyCost") || "0");
  const machineCents = parseAmountToCents(readText(raw, "machineCost") || "0");
  const finishingCents = parseAmountToCents(readText(raw, "finishingCost") || "0");
  const notes = readText(raw, "notes");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
    errors.productId = "Produto inválido.";
  }

  const quantity = parseQuantityInput(quantityText);
  if (quantity === null) {
    errors.quantityProduced = "Informe a quantidade produzida.";
  }

  const laborMinutes = laborText === "" ? 0 : Number(laborText);
  if (laborText !== "" && (!Number.isInteger(laborMinutes) || laborMinutes < 0)) {
    errors.laborMinutesActual = "Informe minutos inteiros.";
  }

  if (energyCents === null || energyCents < 0) {
    errors.energyCost = "Valor inválido.";
  }
  if (machineCents === null || machineCents < 0) {
    errors.machineCost = "Valor inválido.";
  }
  if (finishingCents === null || finishingCents < 0) {
    errors.finishingCost = "Valor inválido.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      productId,
      quantityProduced: quantity as number,
      producedAt: producedAt || new Date().toISOString().slice(0, 10),
      laborMinutesActual: laborMinutes,
      energyCostCents: energyCents ?? 0,
      machineCostCents: machineCents ?? 0,
      finishingCostCents: finishingCents ?? 0,
      notes,
    },
  };
}

export function validateInventoryMovement(
  raw: Record<string, unknown>,
): ValidationResult<InventoryMovementInput> {
  const errors: Record<string, string> = {};
  const itemType = readText(raw, "itemType") as "supply" | "product";
  const itemId = readText(raw, "itemId");
  const movementType = readText(raw, "movementType") as InventoryMovementType;
  const quantityText = readText(raw, "quantity");
  const unitCostCents = parseAmountToCents(readText(raw, "unitCost") || "0");
  const referenceType = readText(raw, "referenceType");
  const referenceId = readText(raw, "referenceId");
  const notes = readText(raw, "notes");

  if (itemType !== "supply" && itemType !== "product") {
    errors.itemType = "Tipo de item inválido.";
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
    errors.itemId = "Item inválido.";
  }

  const validTypes = ["entrada", "saida", "consumo", "perda", "ajuste"];
  if (!validTypes.includes(movementType)) {
    errors.movementType = "Tipo de movimentação inválido.";
  }

  const quantity = parseQuantityInput(quantityText);
  if (quantity === null) {
    errors.quantity = "Informe a quantidade.";
  }

  if (unitCostCents === null || unitCostCents < 0) {
    errors.unitCost = "Custo unitário inválido.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      itemType,
      itemId,
      movementType,
      quantity: quantity as number,
      unitCostCents: unitCostCents ?? 0,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      notes,
    },
  };
}