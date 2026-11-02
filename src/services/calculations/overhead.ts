/**
 * Rateio de despesas operacionais e mão de obra.
 *
 * Calcula o custo indireto por unidade produzida, a partir das despesas
 * mensais e do volume de produção do mês.
 */

export type MonthlyExpense = {
  amountCents: number;
  isActive: boolean;
};

/**
 * Soma as despesas mensais ativas.
 *
 * @param expenses despesas operacionais
 * @returns total mensal em centavos, ou null quando inválido
 */
export function sumMonthlyOverheadCents(expenses: MonthlyExpense[]): number | null {
  let total = 0;

  for (const expense of expenses) {
    if (!expense.isActive) {
      continue;
    }

    if (!Number.isSafeInteger(expense.amountCents) || expense.amountCents < 0) {
      return null;
    }

    const next = total + expense.amountCents;

    if (!Number.isSafeInteger(next)) {
      return null;
    }

    total = next;
  }

  return total;
}

/**
 * Rateia o custo mensal total por unidade produzida.
 *
 * @param totalMonthlyCents custo mensal total em centavos
 * @param monthlyOutputUnits unidades produzidas no mês
 * @returns custo por unidade em centavos, ou null quando inválido
 */
export function allocateOverheadPerUnitCents(
  totalMonthlyCents: number,
  monthlyOutputUnits: number,
): number | null {
  if (
    !Number.isSafeInteger(totalMonthlyCents) ||
    totalMonthlyCents < 0 ||
    !Number.isFinite(monthlyOutputUnits) ||
    monthlyOutputUnits <= 0
  ) {
    return null;
  }

  const perUnit = Math.round(totalMonthlyCents / monthlyOutputUnits);

  return Number.isSafeInteger(perUnit) ? perUnit : null;
}