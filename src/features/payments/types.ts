/**
 * Tipos e rótulos dos meios de pagamento e suas taxas.
 * Os valores existem como enums no banco (ver migration 20261101210000).
 */

export type PaymentMethodKind =
  | "pix"
  | "debito"
  | "credito"
  | "carteira_digital"
  | "outro";

import type { TaxKind } from "@/features/settings/types";

export type { TaxKind } from "@/features/settings/types";
export { TAX_KIND_LABELS } from "@/features/settings/types";

export type PaymentMethod = {
  id: string;
  name: string;
  kind: PaymentMethodKind;
  isActive: boolean;
  notes: string;
};

export type PaymentMethodInput = {
  name: string;
  kind: PaymentMethodKind;
  notes: string;
};

export type PaymentFee = {
  id: string;
  methodId: string;
  label: string;
  kind: TaxKind;
  rate: string | null;
  amountCents: number | null;
  installments: number | null;
  isActive: boolean;
  notes: string;
};

export type PaymentFeeInput = {
  label: string;
  kind: TaxKind;
  rate: string | null;
  amountCents: number | null;
  installments: number | null;
  notes: string;
};

export type PaymentMethodWithFees = {
  method: PaymentMethod;
  fees: PaymentFee[];
};

export const PAYMENT_METHOD_KIND_LABELS: Record<PaymentMethodKind, string> = {
  pix: "Pix",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
  carteira_digital: "Carteira digital",
  outro: "Outro",
};

export const PAYMENT_METHOD_KINDS: PaymentMethodKind[] = [
  "pix",
  "debito",
  "credito",
  "carteira_digital",
  "outro",
];
