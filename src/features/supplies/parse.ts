import type {
  Supply,
  SupplyKind,
  SupplyUnit,
} from "@/features/supplies/types";
import { SUPPLY_KINDS, SUPPLY_UNITS } from "@/features/supplies/types";

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
 * Lê um número de uma linha do banco.
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
 * Converte uma linha de `supplies` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns insumo tipado ou null quando o registro não segue o contrato
 */
export function parseSupplyRow(row: unknown): Supply | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = readString(candidate.name).trim();
  const kind = candidate.kind;
  const unit = candidate.unit;
  const isActive = candidate.isActive ?? candidate.is_active;
  const quantity = readNumber(candidate.quantity);
  const acquiredOnValue = candidate.acquired_on;
  const acquiredOn = typeof acquiredOnValue === "string" ? acquiredOnValue : null;
  const amountCents = readNumber(candidate.amount_cents);
  const freightCents = readNumber(candidate.freight_cents);
  const currentUnitCostCents = readNumber(candidate.unit_cost_cents);

  if (typeof id !== "string" || name.length < 2) {
    return null;
  }

  if (typeof kind !== "string" || !SUPPLY_KINDS.includes(kind as SupplyKind)) {
    return null;
  }

  if (typeof unit !== "string" || !SUPPLY_UNITS.includes(unit as SupplyUnit)) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  const hasNoCost =
    quantity === null &&
    acquiredOn === null &&
    amountCents === null &&
    freightCents === null &&
    currentUnitCostCents === null;

  const hasCompleteCost =
    quantity !== null &&
    quantity > 0 &&
    acquiredOn !== null &&
    isValidAcquisitionDate(acquiredOn) &&
    amountCents !== null &&
    amountCents > 0 &&
    Number.isSafeInteger(amountCents) &&
    freightCents !== null &&
    freightCents >= 0 &&
    Number.isSafeInteger(freightCents) &&
    currentUnitCostCents !== null &&
    currentUnitCostCents >= 0 &&
    Number.isSafeInteger(currentUnitCostCents);

  if (!hasNoCost && !hasCompleteCost) {
    return null;
  }

  return {
    id,
    name,
    kind: kind as SupplyKind,
    unit: unit as SupplyUnit,
    quantity: hasCompleteCost ? quantity : null,
    acquiredOn: hasCompleteCost ? acquiredOn : null,
    amountCents: hasCompleteCost ? amountCents : null,
    freightCents: hasCompleteCost ? freightCents : null,
    currentUnitCostCents: hasCompleteCost ? currentUnitCostCents : null,
    isActive,
    notes: readString(candidate.notes),
  };
}

/**
 * Confirma se o texto é uma data ISO simples (AAAA-MM-DD).
 *
 * @param value valor bruto da coluna acquired_on
 * @returns true quando a data tem formato válido de calendário
 */
function isValidAcquisitionDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
