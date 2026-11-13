import { parseAmountToCents } from "@/lib/money";
import { parsePercentInput } from "@/lib/percent";
import { readText } from "@/lib/validations/settings";
import {
  type PaymentFeeInput,
  type PaymentMethodInput,
  type PaymentMethodKind,
  PAYMENT_METHOD_KINDS,
} from "@/features/payments/types";
import type { TaxKind } from "@/features/settings/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida os dados de um meio de pagamento.
 *
 * @param raw campos do formulário
 * @returns meio normalizado ou mensagens por campo
 */
export function validatePaymentMethod(
  raw: Record<string, unknown>,
): ValidationResult<PaymentMethodInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const kind = readText(raw, "kind") as PaymentMethodKind;
  const notes = readText(raw, "notes");

  if (name.length < 2 || name.length > 80) {
    errors.name = "Informe o nome do meio de pagamento (2 a 80 caracteres).";
  }

  if (!PAYMENT_METHOD_KINDS.includes(kind)) {
    errors.kind = "Escolha o tipo de meio de pagamento.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { name, kind, notes } };
}

/**
 * Valida uma taxa de meio de pagamento.
 * Percentual e valor fixo continuam mutuamente exclusivos.
 *
 * @param raw campos do formulário
 * @returns taxa normalizada ou mensagens por campo
 */
export function validatePaymentFee(
  raw: Record<string, unknown>,
): ValidationResult<PaymentFeeInput> {
  const errors: Record<string, string> = {};

  const label = readText(raw, "label");
  const kind = readText(raw, "kind") as TaxKind;
  const notes = readText(raw, "notes");
  const installmentsText = readText(raw, "installments");

  if (label.length < 2 || label.length > 80) {
    errors.label = "Informe a identificação da taxa (2 a 80 caracteres).";
  }

  if (kind !== "percentual" && kind !== "fixo") {
    errors.kind = "Escolha entre percentual e valor fixo.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  let installments: number | null = null;

  if (installmentsText) {
    const parsed = Number(installmentsText);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 24) {
      errors.installments = "Parcelas deve ser um número entre 1 e 24.";
    } else {
      installments = parsed;
    }
  }

  let rate: string | null = null;
  let amountCents: number | null = null;

  if (kind === "percentual") {
    rate = parsePercentInput(readText(raw, "rate"));

    if (rate === null) {
      errors.rate = "Informe um percentual entre 0 e 100.";
    }
  }

  if (kind === "fixo") {
    amountCents = parseAmountToCents(readText(raw, "amount"));

    if (amountCents === null) {
      errors.amount = "Informe o valor fixo em reais.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: { label, kind, rate, amountCents, installments, notes } };
}
