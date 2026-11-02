import type {
  Supply,
  SupplyKind,
  SupplyPrice,
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

  return {
    id,
    name,
    kind: kind as SupplyKind,
    unit: unit as SupplyUnit,
    isActive,
    notes: readString(candidate.notes),
  };
}

/**
 * Converte uma linha de `supply_prices` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns aquisição tipada ou null quando o registro não segue o contrato
 */
export function parseSupplyPriceRow(row: unknown): SupplyPrice | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const supplyId = candidate.supply_id;
  const quantity = readNumber(candidate.quantity);
  const amountCents = readNumber(candidate.amount_cents);
  const freightCents = readNumber(candidate.freight_cents);
  const unitCostCents = readNumber(candidate.unit_cost_cents);
  const notes = readString(candidate.notes);

  if (typeof id !== "string" || typeof supplyId !== "string") {
    return null;
  }

  if (!isValidAcquisitionDate(readString(candidate.acquired_on))) {
    return null;
  }

  if (
    quantity === null ||
    quantity <= 0 ||
    amountCents === null ||
    amountCents <= 0 ||
    freightCents === null ||
    freightCents < 0 ||
    unitCostCents === null ||
    unitCostCents <= 0 ||
    !Number.isInteger(amountCents) ||
    !Number.isInteger(freightCents) ||
    !Number.isInteger(unitCostCents)
  ) {
    return null;
  }

  return {
    id,
    supplyId,
    supplierId: typeof candidate.supplier_id === "string" ? candidate.supplier_id : null,
    acquiredOn: readString(candidate.acquired_on),
    quantity,
    amountCents,
    freightCents,
    unitCostCents,
    notes,
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

  const parsed = new Date(`${value}T12:00:00Z`);

  return !Number.isNaN(parsed.getTime());
}
