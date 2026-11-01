import type { TaxKind } from "@/features/settings/types";
import { CHANNEL_KINDS, type Channel, type ChannelFee, type ChannelKind } from "./types";

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
 * Converte uma linha de `sales_channels` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns canal tipado ou null quando o registro não segue o contrato
 */
export function parseChannelRow(row: unknown): Channel | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = readString(candidate.name).trim();
  const kind = candidate.kind;
  const isActive = candidate.isActive ?? candidate.is_active;

  if (typeof id !== "string" || name.length < 2) {
    return null;
  }

  if (typeof kind !== "string" || !CHANNEL_KINDS.includes(kind as ChannelKind)) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  return {
    id,
    name,
    kind: kind as ChannelKind,
    isActive,
    notes: readString(candidate.notes),
  };
}

/**
 * Converte uma linha de `channel_fees` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns taxa tipada ou null quando o registro não segue o contrato
 */
export function parseChannelFeeRow(row: unknown): ChannelFee | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const channelId = candidate.channel_id;
  const label = readString(candidate.label).trim();
  const kind = candidate.kind;
  const isActive = candidate.is_active;

  if (typeof id !== "string" || typeof channelId !== "string" || label.length < 2) {
    return null;
  }

  if (kind !== "percentual" && kind !== "fixo") {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  const rate = typeof candidate.rate === "string" ? candidate.rate : null;
  const amountCents = readNumber(candidate.amount_cents);
  const installments = readNumber(candidate.installments);

  if (installments !== null && (!Number.isInteger(installments) || installments < 1 || installments > 24)) {
    return null;
  }

  if (kind === "percentual" && rate === null) {
    return null;
  }

  if (kind === "fixo" && amountCents === null) {
    return null;
  }

  return {
    id,
    channelId,
    label,
    kind: kind as TaxKind,
    rate: kind === "percentual" ? rate : null,
    amountCents: kind === "fixo" ? amountCents : null,
    installments,
    isActive,
    notes: readString(candidate.notes),
  };
}
