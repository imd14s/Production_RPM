import { parseAmountToCents } from "@/lib/money";
import { parsePercentInput } from "@/lib/percent";
import { readText } from "@/lib/validations/settings";
import {
  CHANNEL_KINDS,
  type ChannelFeeInput,
  type ChannelInput,
  type ChannelKind,
} from "@/features/channels/types";
import type { TaxKind } from "@/features/settings/types";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida os dados de um canal de venda.
 *
 * @param raw campos do formulário
 * @returns canal normalizado ou mensagens por campo
 */
export function validateChannel(raw: Record<string, unknown>): ValidationResult<ChannelInput> {
  const errors: Record<string, string> = {};

  const name = readText(raw, "name");
  const kind = readText(raw, "kind") as ChannelKind;
  const notes = readText(raw, "notes");

  if (name.length < 2 || name.length > 80) {
    errors.name = "Informe o nome do canal (2 a 80 caracteres).";
  }

  if (!CHANNEL_KINDS.includes(kind)) {
    errors.kind = "Escolha o tipo de canal.";
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
 * Valida uma taxa de canal.
 * Percentual e valor fixo continuam mutuamente exclusivos.
 *
 * @param raw campos do formulário
 * @returns taxa normalizada ou mensagens por campo
 */
export function validateChannelFee(
  raw: Record<string, unknown>,
): ValidationResult<ChannelFeeInput> {
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
