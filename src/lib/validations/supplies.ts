import { parseAmountToCents } from "@/lib/money";
import { parseQuantityInput } from "@/lib/quantity";
import { readText } from "@/lib/validations/settings";
import type {
  SupplyInput,
  SupplyKind,
  SupplyUnit,
} from "@/features/supplies/types";
import { SUPPLY_KINDS, SUPPLY_UNITS } from "@/features/supplies/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Confirma se o texto é uma data completa do calendário (AAAA-MM-DD).
 *
 * @param value valor do campo de data
 * @returns true quando o formato e a data existem
 */
function isValidDateInput(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  return day >= 1 && day <= daysInMonth;
}

/**
 * Confirma se o valor corresponde a um dia no formato AAAA-MM-DD ou ao dia atual.
 *
 * @param value valor bruto do campo
 * @returns dia em AAAA-MM-DD, usando o dia de hoje quando vazio
 */
function resolveAcquiredOn(value: string): string | null {
  if (!value) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
  }

  return isValidDateInput(value) ? value : null;
}

/**
 * Valida os dados de um insumo.
 *
 * @param raw campos do formulário
 * @returns insumo normalizado ou mensagens por campo
 */
export function validateSupply(raw: Record<string, unknown>): ValidationResult<SupplyInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const kind = readText(raw, "kind") as SupplyKind;
  const unit = readText(raw, "unit") as SupplyUnit;
  const notes = readText(raw, "notes");
  const acquiredOn = resolveAcquiredOn(readText(raw, "acquiredOn"));
  const quantity = parseQuantityInput(readText(raw, "quantity"));
  const amountCents = parseAmountToCents(readText(raw, "amount"));
  const freightText = readText(raw, "freight");
  let freightCents = 0;

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe o nome do insumo (2 a 120 caracteres).";
  }

  if (!SUPPLY_KINDS.includes(kind)) {
    errors.kind = "Escolha a categoria do insumo.";
  }

  if (!SUPPLY_UNITS.includes(unit)) {
    errors.unit = "Escolha a unidade de medida.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (!acquiredOn) {
    errors.acquiredOn = "Informe uma data válida.";
  }

  if (quantity === null) {
    errors.quantity = "Informe a quantidade na unidade de medida do insumo.";
  }

  if (amountCents === null || amountCents <= 0) {
    errors.amount = "Informe o valor pago pelo insumo.";
  }

  if (freightText) {
    const parsedFreight = parseAmountToCents(freightText);

    if (parsedFreight === null || parsedFreight < 0) {
      errors.freight = "Informe um valor de frete válido.";
    } else {
      freightCents = parsedFreight;
    }
  }

  if (
    Object.keys(errors).length > 0 ||
    !acquiredOn ||
    quantity === null ||
    amountCents === null
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      kind,
      unit,
      quantity,
      acquiredOn,
      amountCents,
      freightCents,
      notes,
    },
  };
}
