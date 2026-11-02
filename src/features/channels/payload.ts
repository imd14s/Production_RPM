import type { ChannelFeeInput, ChannelInput } from "@/features/channels/types";

/**
 * Monta o payload de gravação de um canal no formato do banco.
 *
 * @param input canal já validado
 * @returns payload pronto para insert/update
 */
export function buildChannelPayload(input: ChannelInput): Record<string, unknown> {
  return {
    name: input.name,
    kind: input.kind,
    notes: input.notes || null,
  };
}

/**
 * Monta o payload de gravação de uma taxa de canal no formato do banco.
 *
 * @param channelId canal dono da taxa
 * @param input taxa já validada
 * @returns payload pronto para insert/update
 */
export function buildChannelFeePayload(
  channelId: string,
  input: ChannelFeeInput,
): Record<string, unknown> {
  return {
    channel_id: channelId,
    label: input.label,
    kind: input.kind,
    rate: input.rate,
    amount_cents: input.amountCents,
    installments: input.installments,
    notes: input.notes || null,
  };
}
