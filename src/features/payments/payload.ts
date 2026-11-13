import type { PaymentFeeInput, PaymentMethodInput } from "@/features/payments/types";

/**
 * Monta o payload de gravação de um meio de pagamento no formato do banco.
 *
 * @param input meio de pagamento já validado
 * @returns payload pronto para insert/update
 */
export function buildPaymentMethodPayload(input: PaymentMethodInput): Record<string, unknown> {
  return {
    name: input.name,
    kind: input.kind,
    notes: input.notes || null,
  };
}

/**
 * Monta o payload de gravação de uma taxa de pagamento no formato do banco.
 *
 * @param methodId meio de pagamento dono da taxa
 * @param input taxa já validada
 * @returns payload pronto para insert/update
 */
export function buildPaymentFeePayload(
  methodId: string,
  input: PaymentFeeInput,
): Record<string, unknown> {
  return {
    method_id: methodId,
    label: input.label,
    kind: input.kind,
    rate: input.rate,
    amount_cents: input.amountCents,
    installments: input.installments,
    notes: input.notes || null,
  };
}
