import type {
  LaborCostInput,
  OperatingExpenseInput,
} from "@/features/costs/types";

/**
 * Monta o payload de gravação de uma despesa fixa no formato do banco.
 *
 * @param input despesa já validada
 * @returns payload pronto para insert/update
 */
export function buildOperatingExpensePayload(
  input: OperatingExpenseInput,
): Record<string, unknown> {
  return {
    name: input.name,
    amount_cents: input.amountCents,
    notes: input.notes || null,
  };
}

/**
 * Monta o payload de gravação de um custo de mão de obra no formato do banco.
 *
 * @param input custo já validado
 * @returns payload pronto para insert/update
 */
export function buildLaborCostPayload(input: LaborCostInput): Record<string, unknown> {
  return {
    name: input.name,
    monthly_wage_cents: input.monthlyWageCents,
    standard_hours_month: input.standardHoursMonth,
    notes: input.notes || null,
  };
}
