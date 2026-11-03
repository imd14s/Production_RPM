import type { SupplyInput } from "@/features/supplies/types";

/**
 * Calcula o custo atual por unidade do insumo, incluindo frete rateado.
 *
 * @param amountCents valor pago pela compra
 * @param freightCents frete da compra
 * @param quantity quantidade registrada na unidade base do insumo
 * @returns custo por unidade em centavos
 */
export function calculateUnitCostCents(
  amountCents: number,
  freightCents: number,
  quantity: number,
): number {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error("O valor pago deve ser um inteiro positivo em centavos.");
  }

  if (!Number.isSafeInteger(freightCents) || freightCents < 0) {
    throw new Error("O frete deve ser um inteiro não negativo em centavos.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("A quantidade do insumo deve ser maior que zero.");
  }

  const totalCents = amountCents + freightCents;

  if (!Number.isSafeInteger(totalCents)) {
    throw new Error("O valor total ultrapassa o limite seguro em centavos.");
  }

  const unitCostCents = Math.round(totalCents / quantity);

  if (!Number.isSafeInteger(unitCostCents)) {
    throw new Error("O custo por unidade ultrapassa o limite seguro em centavos.");
  }

  return unitCostCents;
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
    quantity: input.quantity,
    acquired_on: input.acquiredOn,
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
