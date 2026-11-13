/**
 * Tipos e rótulos dos canais de venda e suas taxas.
 * Os valores existem como enums no banco (ver migration 20261101200000).
 */

export type ChannelKind = "marketplace" | "site_proprio" | "loja_fisica" | "whatsapp" | "outro";

import type { TaxKind } from "@/features/settings/types";

export type { TaxKind } from "@/features/settings/types";
export { TAX_KIND_LABELS } from "@/features/settings/types";

export type Channel = {
  id: string;
  name: string;
  kind: ChannelKind;
  isActive: boolean;
  notes: string;
};

export type ChannelInput = {
  name: string;
  kind: ChannelKind;
  notes: string;
};

export type ChannelFee = {
  id: string;
  channelId: string;
  label: string;
  kind: TaxKind;
  rate: string | null;
  amountCents: number | null;
  installments: number | null;
  isActive: boolean;
  notes: string;
};

export type ChannelFeeInput = {
  label: string;
  kind: TaxKind;
  rate: string | null;
  amountCents: number | null;
  installments: number | null;
  notes: string;
};

export type ChannelWithFees = {
  channel: Channel;
  fees: ChannelFee[];
};

export const CHANNEL_KIND_LABELS: Record<ChannelKind, string> = {
  marketplace: "Marketplace",
  site_proprio: "Site próprio",
  loja_fisica: "Loja física",
  whatsapp: "WhatsApp",
  outro: "Outro",
};

export const CHANNEL_KINDS: ChannelKind[] = [
  "marketplace",
  "site_proprio",
  "loja_fisica",
  "whatsapp",
  "outro",
];

export const INSTALLMENTS_LABEL = "Qualquer quantidade";
