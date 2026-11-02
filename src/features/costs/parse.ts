import type {
  LaborCost,
  OperatingExpense,
} from "@/features/costs/types";

/**
 * Lê um campo textual de uma linha do banco.
 *
 * @param value valor bruto
 * @returns string ou vazio
 */
function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Lê um campo numérico, aceitando número ou texto numérico.
 *
 * @param value valor bruto
 * @returns número ou null
 */
function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return null;
}

/**
 * Converte uma linha de `operating_expenses` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns despesa tipada ou null quando o registro não segue o contrato
 */
export function parseOperatingExpenseRow(row: unknown): OperatingExpense | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = readString(candidate.name).trim();
  const amountCents = readNumber(candidate.amount_cents);
  const isActive = candidate.is_active;

  if (typeof id !== "string" || name.length < 2) {
    return null;
  }

  if (amountCents === null || amountCents <= 0 || !Number.isInteger(amountCents)) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  return {
    id,
    name,
    amountCents,
    isActive,
    notes: readString(candidate.notes),
  };
}

/**
 * Converte uma linha de `labor_costs` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns custo de mão de obra tipado ou null quando o registro não segue o contrato
 */
export function parseLaborCostRow(row: unknown): LaborCost | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = readString(candidate.name).trim();
  const monthlyWageCents = readNumber(candidate.monthly_wage_cents);
  const standardHoursMonth = readNumber(candidate.standard_hours_month);
  const isActive = candidate.is_active;

  if (typeof id !== "string" || name.length < 2) {
    return null;
  }

  if (monthlyWageCents === null || monthlyWageCents <= 0 || !Number.isInteger(monthlyWageCents)) {
    return null;
  }

  if (
    standardHoursMonth === null ||
    standardHoursMonth <= 0 ||
    standardHoursMonth > 438
  ) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  return {
    id,
    name,
    monthlyWageCents,
    standardHoursMonth,
    isActive,
    notes: readString(candidate.notes),
  };
}
