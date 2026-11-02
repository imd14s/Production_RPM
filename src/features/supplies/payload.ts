import type {
  SupplyInput,
  SupplyPriceInput,
  SupplyUnit,
} from "@/features/supplies/types";
import { SUPPLY_UNIT_LABELS, SUPPLY_UNITS } from "@/features/supplies/types";
import { convertStandardQuantity } from "@/services/calculations/units";

/**
 * Calcula o custo por unidade de uma aquisição, arredondado para o centavo.
 * Matemática de snapshot: frete entra no custo; a divisão é checada —
 * quantidade zero ou inválida não deve conseguir chegar aqui.
 *
 * @param amountCents valor pago pela compra
 * @param freightCents frete da compra
 * @param quantity quantidade adquirida (maior que zero)
 * @returns custo por unidade em centavos
 */
export function calculateUnitCostCents(
  amountCents: number,
  freightCents: number,
  quantity: number,
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantidade de aquisição deve ser maior que zero.");
  }

  return Math.round((amountCents + freightCents) / quantity);
}

/**
 * Converte a quantidade da compra para a unidade base do insumo.
 *
 * @param quantity quantidade digitada na unidade da compra
 * @param purchaseUnit unidade em que o insumo foi comprado
 * @param baseUnit unidade de medida cadastrada no insumo
 * @returns quantidade equivalente na unidade base, com até 6 casas
 */
export function convertQuantityToBaseUnit(
  quantity: number,
  purchaseUnit: SupplyUnit,
  baseUnit: SupplyUnit,
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantidade de aquisição deve ser maior que zero.");
  }

  if (purchaseUnit === baseUnit) {
    return quantity;
  }

  const convertedQuantity = convertStandardQuantity(
    quantity,
    purchaseUnit,
    baseUnit,
  );

  if (convertedQuantity === null) {
    throw new Error(
      `Não é possível converter ${SUPPLY_UNIT_LABELS[purchaseUnit].toLowerCase()} para ${SUPPLY_UNIT_LABELS[baseUnit].toLowerCase()} automaticamente. Use a unidade base do insumo.`,
    );
  }

  if (!Number.isFinite(convertedQuantity) || convertedQuantity <= 0) {
    throw new Error("A conversão não produziu uma quantidade válida.");
  }

  return Math.round(convertedQuantity * 1_000_000_000) / 1_000_000_000;
}

/**
 * Monta o payload de gravação de um insumo no formato do banco.
 *
 * @param input insumo já validado
 * @returns payload pronto para insert/update
 */
export function buildSupplyPayload(input: SupplyInput): Record<string, unknown> {
  return {
    name: input.name,
    kind: input.kind,
    unit: input.unit,
    notes: input.notes || null,
  };
}

/**
 * Monta o payload de gravação de uma aquisição no formato do banco,
 * incluindo o snapshot do custo por unidade.
 *
 * @param supplyId insumo dono da aquisição
 * @param input aquisição já validada
 * @returns payload pronto para insert/update
 */
export function buildSupplyPricePayload(
  supplyId: string,
  input: SupplyPriceInput,
  baseUnit: SupplyUnit,
): Record<string, unknown> {
  const quantityInBaseUnit = convertQuantityToBaseUnit(
    input.quantity,
    input.purchaseUnit,
    baseUnit,
  );

  return {
    supply_id: supplyId,
    supplier_id: input.supplierId || null,
    acquired_on: input.acquiredOn,
    quantity: input.quantity,
    purchase_unit: input.purchaseUnit,
    amount_cents: input.amountCents,
    freight_cents: input.freightCents,
    unit_cost_cents: calculateUnitCostCents(
      input.amountCents,
      input.freightCents,
      quantityInBaseUnit,
    ),
    notes: input.notes || null,
  };
}

/**
 * Confirma se a unidade existe nos tipos aceitos.
 *
 * @param value valor bruto do campo unit
 * @returns unidade tipada ou null
 */
export function parseSupplyUnit(value: unknown): SupplyUnit | null {
  return typeof value === "string" && SUPPLY_UNITS.includes(value as SupplyUnit)
    ? (value as SupplyUnit)
    : null;
}
