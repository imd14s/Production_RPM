/**
 * Motor de precificação — fórmula-base e aplicação de taxas.
 *
 * Única fonte de verdade dos cálculos de preço. Telas e Server Actions apenas
 * montam a entrada e exibem o resultado. Dinheiro em centavos inteiros;
 * percentuais em decimal (0.1 = 10%).
 */

export type Fee = {
  /** percentual ou fixo */
  kind: "percentual" | "fixo";
  /** taxa percentual em decimal (0..1), quando kind = percentual */
  rate: number | null;
  /** valor fixo em centavos, quando kind = fixo */
  amountCents: number | null;
};

export type PriceCalculationInput = {
  /** Custo completo em centavos (materiais, mão de obra, despesas). */
  costCents: number;
  /** Taxas fixas em centavos (valores fixos de canal/pagamento). */
  fixedFeesCents: number;
  /** Percentuais variáveis somados (impostos + comissões + taxas %). */
  variablePercent: number;
  /** Margem desejada em decimal (0..1). */
  marginPercent: number;
};

export type PriceCalculationResult =
  | { ok: true; priceCents: number }
  | { ok: false; reason: string };

const MAXIMUM_PERCENT = 1;

/**
 * Soma os valores fixos de uma lista de taxas.
 *
 * @param fees taxas (percentuais são ignoradas)
 * @returns total em centavos
 */
export function sumFixedFeesCents(fees: Fee[]): number {
  let total = 0;

  for (const fee of fees) {
    if (fee.kind === "fixo" && fee.amountCents !== null && Number.isSafeInteger(fee.amountCents) && fee.amountCents >= 0) {
      const next = total + fee.amountCents;

      if (!Number.isSafeInteger(next)) {
        return total;
      }

      total = next;
    }
  }

  return total;
}

/**
 * Soma os percentuais de uma lista de taxas.
 *
 * @param fees taxas (fixas são ignoradas)
 * @returns soma em decimal
 */
export function sumVariablePercent(fees: Fee[]): number {
  let total = 0;

  for (const fee of fees) {
    if (
      fee.kind === "percentual" &&
      fee.rate !== null &&
      Number.isFinite(fee.rate) &&
      fee.rate >= 0 &&
      fee.rate <= MAXIMUM_PERCENT
    ) {
      total += fee.rate;
    }
  }

  return total;
}

/**
 * Calcula o preço a partir da fórmula-base.
 *
 * @param input custo, taxas fixas, percentuais variáveis e margem
 * @returns preço em centavos ou motivo de falha
 */
export function calculatePriceCents(
  input: PriceCalculationInput,
): PriceCalculationResult {
  const { costCents, fixedFeesCents, variablePercent, marginPercent } = input;

  if (!Number.isSafeInteger(costCents) || costCents < 0) {
    return { ok: false, reason: "Custo inválido." };
  }

  if (!Number.isSafeInteger(fixedFeesCents) || fixedFeesCents < 0) {
    return { ok: false, reason: "Taxas fixas inválidas." };
  }

  if (!Number.isFinite(variablePercent) || variablePercent < 0 || variablePercent > MAXIMUM_PERCENT) {
    return { ok: false, reason: "Percentual variável inválido." };
  }

  if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent > MAXIMUM_PERCENT) {
    return { ok: false, reason: "Margem inválida." };
  }

  const denominator = 1 - (variablePercent + marginPercent);

  if (!Number.isFinite(denominator) || denominator <= 0) {
    return { ok: false, reason: "Denominador inválido." };
  }

  const numerator = costCents + fixedFeesCents;

  if (!Number.isSafeInteger(numerator)) {
    return { ok: false, reason: "Valores excedem o limite seguro." };
  }

  const price = Math.round(numerator / denominator);

  if (!Number.isSafeInteger(price) || price < 0) {
    return { ok: false, reason: "Preço fora do limite seguro." };
  }

  return { ok: true, priceCents: price };
}