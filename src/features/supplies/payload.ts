import type {
  SupplyInput,
  SupplyKind,
  SupplyPriceInput,
  SupplyUnit,
} from "@/features/supplies/types";
import { SUPPLY_UNITS } from "@/features/supplies/types";
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
): number | null {
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
    return null;
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
 * Monta o payload da aquisição e salva o custo por unidade comprada.
 *
 * @param supplyId insumo dono da aquisição
 * @param input aquisição já validada
 * @returns payload pronto para insert/update
 */
export function buildSupplyPricePayload(
  supplyId: string,
  input: SupplyPriceInput,
): Record<string, unknown> {
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
      input.quantity,
    ),
    notes: input.notes || null,
  };
}

/**
 * Monta os argumentos da operação que cria o insumo e sua primeira compra.
 *
 * @param supply dados do novo insumo
 * @param price dados da primeira compra
 * @returns argumentos tipados para a função transacional do banco
 */
export function buildSupplyWithInitialPricePayload(
  supply: SupplyInput,
  price: SupplyPriceInput,
): {
  p_name: string;
  p_kind: SupplyKind;
  p_unit: SupplyUnit;
  p_supply_notes: string | null;
  p_acquired_on: string;
  p_quantity: number;
  p_purchase_unit: SupplyUnit;
  p_amount_cents: number;
  p_freight_cents: number;
  p_unit_cost_cents: number;
} {
  return {
    p_name: supply.name,
    p_kind: supply.kind,
    p_unit: supply.unit,
    p_supply_notes: supply.notes || null,
    p_acquired_on: price.acquiredOn,
    p_quantity: price.quantity,
    p_purchase_unit: price.purchaseUnit,
    p_amount_cents: price.amountCents,
    p_freight_cents: price.freightCents,
    p_unit_cost_cents: calculateUnitCostCents(
      price.amountCents,
      price.freightCents,
      price.quantity,
    ),
  };
}

/**
 * Calcula custo por unidade base quando a unidade comprada é compatível.
 *
 * @param input compra persistida
 * @param baseUnit unidade cadastrada no insumo
 * @returns custo unitário na unidade base, ou null para unidades incompatíveis
 */
export function calculateUnitCostInBaseUnit(
  input: Pick<SupplyPriceInput, "quantity" | "purchaseUnit" | "amountCents" | "freightCents">,
  baseUnit: SupplyUnit,
): number | null {
  const quantityInBaseUnit = convertQuantityToBaseUnit(
    input.quantity,
    input.purchaseUnit,
    baseUnit,
  );

  return quantityInBaseUnit === null
    ? null
    : calculateUnitCostCents(input.amountCents, input.freightCents, quantityInBaseUnit);
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
