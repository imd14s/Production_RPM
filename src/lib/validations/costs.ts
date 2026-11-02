import { parseAmountToCents } from "@/lib/money";
import { parseHoursInput } from "@/lib/hours";
import { readText } from "@/lib/validations/settings";
import type {
  LaborCostInput,
  OperatingExpenseInput,
} from "@/features/costs/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida os dados de uma despesa fixa.
 *
 * @param raw campos do formulário
 * @returns despesa normalizada ou mensagens por campo
 */
export function validateOperatingExpense(
  raw: Record<string, unknown>,
): ValidationResult<OperatingExpenseInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const notes = readText(raw, "notes");

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe o nome da despesa (2 a 120 caracteres).";
  }

  const amountCents = parseAmountToCents(readText(raw, "amount"));

  if (amountCents === null || amountCents <= 0) {
    errors.amount = "Informe um valor mensal maior que zero.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, amountCents: amountCents as number, notes } };
}

/**
 * Valida os dados de um custo de mão de obra.
 *
 * @param raw campos do formulário
 * @returns custo normalizado ou mensagens por campo
 */
export function validateLaborCost(
  raw: Record<string, unknown>,
): ValidationResult<LaborCostInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const notes = readText(raw, "notes");

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe o nome da pessoa ou função (2 a 120 caracteres).";
  }

  const monthlyWageCents = parseAmountToCents(readText(raw, "wage"));

  if (monthlyWageCents === null || monthlyWageCents <= 0) {
    errors.wage = "Informe um salário mensal maior que zero.";
  }

  const standardHoursMonth = parseHoursInput(readText(raw, "hours"));

  if (standardHoursMonth === null || standardHoursMonth > 438) {
    errors.hours = "Informe as horas mensais (até 438, pode usar vírgula).";
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
      name,
      monthlyWageCents: monthlyWageCents as number,
      standardHoursMonth: standardHoursMonth as number,
      notes,
    },
  };
}
